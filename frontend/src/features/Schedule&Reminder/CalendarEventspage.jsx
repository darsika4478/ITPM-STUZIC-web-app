// CalendarEventsPopover.jsx
import { useEffect, useRef } from "react";

export default function CalendarEventsPopover({
  dateKey,
  position,
  eventsByDate,
  onClose,
}) {
  const popRef = useRef(null);

  useEffect(() => {
    if (!dateKey) return;

    const handleClickOutside = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) onClose?.();
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dateKey, onClose]);

  if (!dateKey) return null;

  const items = eventsByDate?.[dateKey] || [];

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
                <li key={idx} className={`text-xs p-2 rounded ${getEventAccent(ev.category)}`}>
                  {ev.time ? <span className="font-semibold mr-2">{ev.time}</span> : null}
                  {ev.title || "Event"}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No events</p>
        )}
      </div>

      {/* UI-only button for future event creation */}
      <button
        type="button"
        className="w-full bg-[#696FC7] text-white px-4 py-2 rounded hover:bg-[#8F8BB6] text-sm font-semibold"
        onClick={() => {}}
      >
        Add Event
      </button>
    </div>
  );
}