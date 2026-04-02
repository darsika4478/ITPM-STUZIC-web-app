// CalendarEventsPopover.jsx
import { useEffect, useRef, useState } from "react";
import CalendarAddEventForm from "./CalendarAddEventForm.jsx";

export default function CalendarEventsPopover({
  dateKey,
  position,
  eventsByDate,
  onClose,
  onEditEvent,     
  onDeleteEvent, 
}) {
  const popRef = useRef(null);
  const [showAddEventForm, setShowAddEventForm] = useState(false);

  useEffect(() => {
    if (!dateKey) return;

    const handleClickOutside = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) onClose?.();
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dateKey, onClose]);

  useEffect(() => {
    if (!dateKey) setShowAddEventForm(false);
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

  const getEventAccent = (category) => {
    switch (category) {
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
      className="absolute bg-[#28244d] border border-[#b9b6d9] text-white p-4 rounded-xl shadow-lg w-72 z-50"
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

              return (
                <li
                  key={idx}
                  className={`text-xs p-2 rounded ${getEventAccent(ev.category)} flex justify-between items-start`}
                >
                  <div>
                    {ev.time ? (
                      <span className="font-semibold mr-2">{ev.time}</span>
                    ) : null}
                    {ev.title || "Event"}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-1 ml-2">
                    <button
                      type="button"
                      disabled={isPastDate}
                      onClick={() => !isPastDate && onEditEvent?.(dateKey, idx, ev)}
                      className={`px-2 py-0.5 rounded text-[10px]
                        ${isPastDate
                          ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={isPastDate}
                      onClick={() => !isPastDate && onDeleteEvent?.(dateKey, idx)}
                      className={`px-2 py-0.5 rounded text-[10px]
                        ${isPastDate
                          ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600 text-white"}`}
                    >
                      Delete
                    </button>
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
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white text-black shadow"
              onClick={() => setShowAddEventForm(false)}
            >
              ✕
            </button>
            <CalendarAddEventForm
              selectedDate={selectedDate}
              onSave={() => setShowAddEventForm(false)}
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