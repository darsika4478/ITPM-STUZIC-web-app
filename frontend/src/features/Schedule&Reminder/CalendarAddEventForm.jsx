import React, { useState, useEffect } from "react";

export default function EventForm({ onSave, selectedDate, onSuccessfulSave }) {
  const [type, setType] = useState("Study Session");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [reminder, setReminder] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const datePrefix = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : "";

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("default", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  useEffect(() => {
    setType("Study Session");
    setTitle("");
    setStartTime("");
    setEndTime("");
    setDeadlineTime("");
    setReminder("");
    setError("");
    setSuccess(false);
  }, [selectedDate]);

  const combineDateTime = (time) => {
    if (!time || !datePrefix) return "";
    return `${datePrefix}T${time}`;
  };

  const validate = () => {
    if (!selectedDate || !datePrefix)
      return "Please select a calendar date first.";

    if (!title || title.length < 3)
      return "Title must be at least 3 characters.";

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDayStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    if (selectedDayStart < todayStart)
      return "Cannot create events on past dates.";

    if (type !== "Deadline") {
      if (!startTime || !endTime)
        return "Both start and end time are required.";

      const start = new Date(combineDateTime(startTime));
      const end = new Date(combineDateTime(endTime));
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        return "Please enter valid start and end times.";

      if (start < now)
        return "Start time cannot be in the past.";
      if (start >= end)
        return "End time must be after start time.";

      if (type === "Study Session") {
        const duration = (end - start) / (1000 * 60);
        if (duration < 30)
          return `Study session is too short — minimum is 30 minutes (currently ${Math.round(duration)} min).`;
        if (duration > 240)
          return `Study session is too long — maximum is 240 minutes (currently ${Math.round(duration)} min).`;
      }

      if (reminder) {
        const r = new Date(combineDateTime(reminder));
        if (Number.isNaN(r.getTime()))
          return "Please enter a valid reminder time.";
        if (r < now)
          return "Reminder cannot be in the past.";
        if (r >= start)
          return "Reminder must be set before the start time.";
      }
    } else {
      if (!deadlineTime)
        return "Deadline time is required.";

      const deadline = new Date(combineDateTime(deadlineTime));
      if (Number.isNaN(deadline.getTime()))
        return "Please enter a valid deadline time.";
      if (deadline < now)
        return "Deadline cannot be in the past.";

      if (reminder) {
        const r = new Date(combineDateTime(reminder));
        if (Number.isNaN(r.getTime()))
          return "Please enter a valid reminder time.";
        if (r < now)
          return "Reminder cannot be in the past.";
        if (r >= deadline)
          return "Reminder must be set before the deadline.";
      }
    }

    return null;
  };

  // ✅ No direct Firestore calls — Calendarpage handles all saving
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();

    if (err) {
      setError(err);
      setSuccess(false);
      return;
    }

    setError("");
    setSuccess(false);

    const newEvent = {
      type,
      title,
      startTime: combineDateTime(startTime),
      endTime: combineDateTime(endTime),
      deadlineTime: combineDateTime(deadlineTime),
      reminder: combineDateTime(reminder),
    };

    try {
      if (onSave) await onSave(newEvent);

      if (onSuccessfulSave) {
        onSuccessfulSave();
        return;
      }

      setSuccess(true);
      setTitle("");
      setStartTime("");
      setEndTime("");
      setDeadlineTime("");
      setReminder("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (saveErr) {
      const code = saveErr?.code || "";
      const msg =
        saveErr?.message ||
        (code === "permission-denied"
          ? "Firestore blocked this save. Check Firestore rules."
          : "Could not save the event. Check the browser console.");
      setError(msg);
      setSuccess(false);
    }
  };

  return (
    <div className="bg-[#28244d] p-4 sm:p-6 rounded-2xl shadow-xl w-full max-w-md text-white max-h-[85vh] overflow-y-auto">

      {/* Selected Date Banner */}
      {formattedDate ? (
        <div className="bg-[#3b3670] border border-[#5b52b5] rounded-xl px-4 py-3 mb-5">
          <p className="text-[11px] uppercase tracking-widest text-[#a89fdd] font-semibold mb-0.5">
            Adding event for
          </p>
          <p className="text-base font-semibold text-white">{formattedDate}</p>
        </div>
      ) : (
        <div className="bg-[#3b3670] border border-dashed border-[#5b52b5] rounded-xl px-4 py-3 mb-5 text-center">
          <p className="text-sm text-[#a89fdd] italic">No date selected — click a calendar date first</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Add Event</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Type */}
        <div>
          <label className="text-xs text-[#a89fdd] mb-1 block uppercase tracking-wide">Event Type</label>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setError(""); }}
            className="w-full p-2 border border-[#5b52b5] rounded-lg bg-[#3b3670] text-white"
          >
            <option>Study Session</option>
            <option>Lecture</option>
            <option>Deadline</option>
          </select>
          {type === "Study Session" && (
            <p className="text-[11px] text-[#a89fdd] mt-1">Duration must be between 30 and 240 minutes.</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-[#a89fdd] mb-1 block uppercase tracking-wide">Title</label>
          <input
            type="text"
            placeholder="e.g. Math Revision"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
            className="w-full p-2 border border-[#5b52b5] rounded-lg bg-[#3b3670] text-white placeholder-[#7b72b5]"
          />
          <p className="text-[11px] text-[#a89fdd] mt-1">Minimum 3 characters.</p>
        </div>

        {/* Start + End for Study Session / Lecture */}
        {type !== "Deadline" && (
          <>
            <div>
              <label className="text-xs text-[#a89fdd] mb-1 block uppercase tracking-wide">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setError(""); }}
                className="w-full p-2 border border-[#5b52b5] rounded-lg bg-[#3b3670] text-white"
              />
            </div>

            <div>
              <label className="text-xs text-[#a89fdd] mb-1 block uppercase tracking-wide">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setError(""); }}
                className="w-full p-2 border border-[#5b52b5] rounded-lg bg-[#3b3670] text-white"
              />
            </div>

            {/* Live duration preview for Study Session */}
            {type === "Study Session" && startTime && endTime && (() => {
              const start = new Date(combineDateTime(startTime));
              const end = new Date(combineDateTime(endTime));
              const mins = Math.round((end - start) / (1000 * 60));
              if (isNaN(mins) || mins <= 0) return null;
              const isValid = mins >= 30 && mins <= 240;
              return (
                <p className={`text-xs font-medium ${isValid ? "text-green-400" : "text-red-400"}`}>
                  Duration: {mins} min {isValid ? "✓" : "— must be 30–240 min"}
                </p>
              );
            })()}
          </>
        )}

        {/* Deadline */}
        {type === "Deadline" && (
          <div>
            <label className="text-xs text-[#a89fdd] mb-1 block uppercase tracking-wide">Deadline Time</label>
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => { setDeadlineTime(e.target.value); setError(""); }}
              className="w-full p-2 border border-[#5b52b5] rounded-lg bg-[#3b3670] text-white"
            />
          </div>
        )}

        {/* Reminder */}
        <div>
          <label className="text-xs text-[#a89fdd] mb-1 block uppercase tracking-wide">
            Reminder Time <span className="normal-case text-[#7b72b5]">(optional)</span>
          </label>
          <input
            type="time"
            value={reminder}
            onChange={(e) => { setReminder(e.target.value); setError(""); }}
            className="w-full p-2 border border-[#5b52b5] rounded-lg bg-[#3b3670] text-white"
          />
          <p className="text-[11px] text-[#a89fdd] mt-1">Must be before start / deadline time.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 text-sm px-4 py-2 rounded-lg">
            ⚠ {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-900/40 border border-green-500 text-green-300 text-sm px-4 py-2 rounded-lg">
            ✓ Event saved successfully!
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedDate}
          className="w-full bg-[#696FC7] text-white py-2 rounded-lg hover:bg-[#8F8BB6] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Save Event
        </button>

      </form>
    </div>
  );
}