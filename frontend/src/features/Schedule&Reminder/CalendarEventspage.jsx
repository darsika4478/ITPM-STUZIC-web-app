// CalendarEventsPopover.jsx
import { useEffect, useRef, useState } from "react";
import CalendarAddEventForm from "./CalendarAddEventForm.jsx";

function isoToTimeInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Map Firestore-shaped UI event from calendarEventHelpers to form fields */
function mapEvToInitialValues(ev) {
  const raw = ev?.type || "";
  const cat = ev?.category || "";
  let type = "Study Session";
  if (raw === "Lecture" || cat === "Lectures") type = "Lecture";
  else if (raw === "Deadline" || cat === "Deadlines") type = "Deadline";
  else if (raw === "Study Session") type = "Study Session";
  return {
    type,
    title: ev?.title || "",
    startTime: isoToTimeInput(ev?.startTime),
    endTime: isoToTimeInput(ev?.endTime),
    deadlineTime: isoToTimeInput(ev?.deadlineTime),
    reminder: isoToTimeInput(ev?.reminder),
  };
}

export default function CalendarEventsPopover({
  dateKey,
  position,
  eventsByDate,
  onClose,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}) {
  const popRef = useRef(null);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingIdx, setDeletingIdx] = useState(null);

  useEffect(() => {
    if (!dateKey) return;

    const handleClickOutside = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) onClose?.();
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dateKey, onClose]);

  useEffect(() => {
    if (!dateKey) {
      setShowAddEventForm(false);
      setEditingEvent(null);
      return;
    }
    setShowAddEventForm(false);
    setEditingEvent(null);
  }, [dateKey]);

  if (!dateKey) return null;

  const items = eventsByDate?.[dateKey] || [];
  const selectedDate = dateKey ? new Date(`${dateKey}T00:00:00`) : null;

  const isPastDate = (() => {
    if (!selectedDate) return false;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    return dateStart < todayStart;
  })();

  const closeForm = () => {
    setShowAddEventForm(false);
  };

  const closeEditForm = () => {
    setEditingEvent(null);
  };

  const handleDeleteClick = async (e, idx) => {
    e.stopPropagation();
    if (typeof onDeleteEvent !== "function") return;
    if (!window.confirm("Delete this event?")) return;
    setDeletingIdx(idx);
    try {
      await onDeleteEvent(dateKey, idx);
    } catch {
      /* parent / Firestore may surface error */
    } finally {
      setDeletingIdx(null);
    }
  };

  const getEventAccent = (category) => {
    switch (category) {
      case "Study Session":
        return "bg-[#FFECC0] text-[#B500B2] border-l-[3px] border-[#B500B2]";
      case "Lectures":
        return "bg-[#fff3cd] text-[#856404] border-l-[3px] border-[#f97316]";
      case "Deadlines":
        return "bg-[#d1fae5] text-[#065f46] border-l-[3px] border-[#10b981]";
      case "work":
        return "bg-[#e0f2fe] text-[#0369a1] border-l-[3px] border-[#0ea5e9]";
      case "personal":
        return "bg-[#fff3cd] text-[#856404] border-l-[3px] border-[#fbbf24]";
      case "education":
        return "bg-[#d1fae5] text-[#065f46] border-l-[3px] border-[#10b981]";
      default:
        return "bg-[#ede9fe] text-[#5b21b6] border-l-[3px] border-[#8b5cf6]";
    }
  };

  return (
    <div
      ref={popRef}
      className="absolute bg-[#28244d] border border-[#b9b6d9] text-white p-4 rounded-xl shadow-lg w-[min(100vw-2rem,20rem)] z-50"
      style={{ top: position?.top ?? 0, left: position?.left ?? 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-sm">{dateKey}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm px-2 py-1 rounded hover:bg-[#322f53]"
        >
          ✕
        </button>
      </div>

      <div className="mb-2 max-h-56 overflow-y-auto">
        {items.length ? (
          <ul className="space-y-2">
            {items.map((ev, idx) => {
              if (typeof ev === "string") {
                return (
                  <li key={idx} className="text-xs p-2 rounded border border-gray-200">
                    {ev}
                  </li>
                );
              }

              const canManage = Boolean(ev.id);

              return (
                <li
                  key={ev.id || idx}
                  className={`text-xs p-2 rounded ${getEventAccent(ev.category)}`}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      {ev.time ? (
                        <span className="font-semibold mr-2">{ev.time}</span>
                      ) : null}
                      <span className="wrap-break-word">{ev.title || "Event"}</span>
                    </div>
                    {canManage ? (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          title="Edit"
                          disabled={!onUpdateEvent}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddEventForm(false);
                            setEditingEvent({ ev, idx });
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-[#3b3670] text-[#c4b5fd] border border-[#5b52b5] hover:bg-[#4a4490] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          disabled={!onDeleteEvent || deletingIdx === idx}
                          onClick={(e) => handleDeleteClick(e, idx)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-red-950/50 text-red-200 border border-red-800/60 hover:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {deletingIdx === idx ? "…" : "Delete"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No events</p>
        )}
      </div>

      {showAddEventForm ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-md">
            <button
              type="button"
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white text-black shadow z-10"
              onClick={closeForm}
            >
              ✕
            </button>
            <CalendarAddEventForm
              selectedDate={selectedDate}
              onSuccessfulSave={closeForm}
              onSave={async (payload) => {
                if (typeof onAddEvent !== "function") {
                  throw new Error("Calendar save is not wired (onAddEvent missing).");
                }
                await onAddEvent(dateKey, payload);
              }}
            />
          </div>
        </div>
      ) : null}

      {editingEvent && selectedDate ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-md">
            <button
              type="button"
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white text-black shadow z-10"
              onClick={closeEditForm}
            >
              ✕
            </button>
            <CalendarAddEventForm
              key={editingEvent.ev.id}
              isEditing
              initialValues={mapEvToInitialValues(editingEvent.ev)}
              selectedDate={selectedDate}
              onSuccessfulSave={closeEditForm}
              onSave={async (payload) => {
                if (typeof onUpdateEvent !== "function") {
                  throw new Error("Calendar update is not wired (onUpdateEvent missing).");
                }
                await onUpdateEvent(dateKey, editingEvent.ev.id, payload);
              }}
            />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={isPastDate}
        className={`w-full px-4 py-2 rounded text-sm font-semibold transition
          ${isPastDate
            ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-60"
            : "bg-[#696FC7] text-white hover:bg-[#8F8BB6]"}`}
        onClick={() => {
          if (isPastDate) return;
          setShowAddEventForm(true);
        }}
      >
        Add Event
      </button>
    </div>
  );
}
