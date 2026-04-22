import React, { useState, useEffect, useMemo, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { buildEventsMapFromSnapshot, formatHHMM } from "./calendarEventHelpers.js";
import CalendarEventsPopover from "./CalendarEventspage.jsx";

function formatEventStartEnd(ev) {
  if (!ev) return "";
  if (ev.type === "Deadline" && ev.deadlineTime) {
    const d = new Date(ev.deadlineTime);
    return Number.isNaN(d.getTime()) ? (ev.time || "") : formatHHMM(d);
  }
  const start = ev.startTime ? new Date(ev.startTime) : null;
  const end = ev.endTime ? new Date(ev.endTime) : null;
  if (
    start &&
    !Number.isNaN(start.getTime()) &&
    end &&
    !Number.isNaN(end.getTime())
  ) {
    return `${formatHHMM(start)} - ${formatHHMM(end)}`;
  }
  if (start && !Number.isNaN(start.getTime())) return formatHHMM(start);
  return ev.time || "";
}

export default function CalendarUI() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [eventsPopover, setEventsPopover] = useState({
    dateKey: null,
    position: { top: 0, left: 0 },
  });
  const [eventsByDate, setEventsByDate] = useState({});
  const [calendarRulesError, setCalendarRulesError] = useState(null);
  /** @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]} */
  const [categoryFilterModal, setCategoryFilterModal] = useState(null);
  const [inAppNotificationsEnabled, setInAppNotificationsEnabled] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const notifiedReminderIdsRef = useRef(new Set());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonthDate = new Date(year, month, 0);
  const prevMonthDays = prevMonthDate.getDate();
  const prevMonthDates = Array.from(
    { length: firstDay },
    (_, i) => prevMonthDays - firstDay + i + 1
  );

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const nextMonthDates = Array.from(
    { length: totalCells - (firstDay + daysInMonth) },
    (_, i) => i + 1
  );

  // ✅ Listen to top-level calendarEvents filtered by userId
  useEffect(() => {
    let unsubFirestore = () => {};
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubFirestore();
      if (!user || !db) {
        setEventsByDate({});
        setCalendarRulesError(null);
        return;
      }
      const uid = user.uid;
      void user.getIdToken().then(() => {
        if (auth.currentUser?.uid !== uid) return;
        const q = query(
          collection(db, "calendarEvents"),
          where("userId", "==", uid)
        );
        unsubFirestore = onSnapshot(
          q,
          (snap) => {
            setEventsByDate(buildEventsMapFromSnapshot(snap));
            setCalendarRulesError(null);
          },
          (err) => {
            console.error("calendarEvents listener error:", err);
            setEventsByDate({});
            if (err?.code === "permission-denied") {
              setCalendarRulesError(
                "Firestore is blocking calendar data. Publish the rules from firestore.rules in this project."
              );
            } else {
              setCalendarRulesError(err?.message || "Could not load calendar events.");
            }
          }
        );
      });
    });
    return () => {
      unsubAuth();
      unsubFirestore();
    };
  }, []);

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setEventsPopover({ dateKey: null, position: { top: 0, left: 0 } });
    setCategoryFilterModal(null);
  };
  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setEventsPopover({ dateKey: null, position: { top: 0, left: 0 } });
    setCategoryFilterModal(null);
  };
  const goToday = () => {
    setCurrentDate(today);
    setSelectedDate(today);
    setEventsPopover({ dateKey: null, position: { top: 0, left: 0 } });
    setCategoryFilterModal(null);
  };

  const formatDateKey = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const selectedKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(today);

  const openEventsPopover = (e, dateObj) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const key = formatDateKey(dateObj);
    setEventsPopover({
      dateKey: key,
      position: {
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      },
    });
    setSelectedDate(dateObj);
  };

  const closeEventsPopover = () => {
    setEventsPopover({ dateKey: null, position: { top: 0, left: 0 } });
  };

  const isPastDateKey = (dateKey) => {
    if (!dateKey) return false;
    const date = new Date(`${dateKey}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return date < todayStart;
  };

  const getDateSafe = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const getEventRange = (ev) => {
    if (!ev) return null;
    if (ev.type === "Deadline") {
      const point = getDateSafe(ev.deadlineTime);
      if (!point) return null;
      return { start: point, end: new Date(point.getTime() + 60 * 1000) };
    }
    const start = getDateSafe(ev.startTime);
    const end = getDateSafe(ev.endTime);
    if (!start || !end) return null;
    const normalizedEnd = end > start ? end : new Date(start.getTime() + 60 * 1000);
    return { start, end: normalizedEnd };
  };

  const assertNoOverlap = (dateKey, candidatePayload, excludeEventId = null) => {
    const candidateRange = getEventRange(candidatePayload);
    if (!candidateRange) return;
    const dayEvents = eventsByDate[dateKey] || [];
    for (const ev of dayEvents) {
      if (!ev || !ev.id) continue;
      if (excludeEventId && ev.id === excludeEventId) continue;
      const existingRange = getEventRange(ev);
      if (!existingRange) continue;
      const overlap =
        candidateRange.start < existingRange.end &&
        existingRange.start < candidateRange.end;
      if (overlap) {
        throw new Error(`Time overlaps with "${ev.title || "another event"}".`);
      }
    }
  };

  // ✅ Save to top-level calendarEvents with userId
  const handleAddEvent = async (dateKey, payload) => {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be signed in to save events.");
    if (!db) throw new Error("Firebase is not configured. Check your .env file.");
    if (isPastDateKey(dateKey)) {
      throw new Error("Cannot create events on past dates.");
    }
    assertNoOverlap(dateKey, payload);
    try {
      const docRef = await addDoc(collection(db, "calendarEvents"), {
        userId: user.uid,
        dateKey,
        type: payload.type,
        title: payload.title,
        startTime: payload.startTime || "",
        endTime: payload.endTime || "",
        deadlineTime: payload.deadlineTime || "",
        reminder: payload.reminder || "",
        createdAt: serverTimestamp(),
      });
      console.info("[Calendar] Saved:", docRef.path);
    } catch (err) {
      console.error("[Calendar] Save failed:", err);
      throw err;
    }
  };

  // ✅ Update existing event
  const handleUpdateEvent = async (dateKey, eventId, payload) => {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be signed in to update events.");
    if (!eventId) throw new Error("Missing event id.");
    if (isPastDateKey(dateKey)) {
      throw new Error("Past events cannot be edited.");
    }
    assertNoOverlap(dateKey, payload, eventId);
    try {
      await updateDoc(doc(db, "calendarEvents", eventId), {
        type: payload.type,
        title: payload.title,
        startTime: payload.startTime || "",
        endTime: payload.endTime || "",
        deadlineTime: payload.deadlineTime || "",
        reminder: payload.reminder || "",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("[Calendar] Update failed:", err);
      throw err;
    }
  };

  // ✅ Delete event
  const handleDeleteEvent = async (dateKey, idx) => {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be signed in to delete events.");
    if (isPastDateKey(dateKey)) {
      throw new Error("Past events cannot be deleted.");
    }
    const ev = eventsByDate[dateKey]?.[idx];
    if (!ev?.id) throw new Error("Cannot delete this event.");
    try {
      await deleteDoc(doc(db, "calendarEvents", ev.id));
    } catch (err) {
      console.error("[Calendar] Delete failed:", err);
      throw err;
    }
  };

  const normalizeEventLabel = (label = "") => {
    const value = String(label).trim().toLowerCase();
    if (value === "lecture" || value === "lectures") return "Lectures";
    if (value === "deadline" || value === "deadlines") return "Deadlines";
    if (value === "exam" || value === "exams") return "Exams";
    return "Study Session";
  };

  const CATEGORY_ITEMS = [
    { name: "Study Session", color: "#A855F7" },
    { name: "Lectures", color: "#f97316" },
    { name: "Deadlines", color: "#10b981" },
    { name: "Exams", color: "#78350F" },
  ];

  const { upcomingByCategory, categoryCounts } = useMemo(() => {
    const buckets = {
      "Study Session": [],
      "Lectures": [],
      "Deadlines": [],
      "Exams": [],
    };
    for (const [dateKey, events] of Object.entries(eventsByDate || {})) {
      if (isPastDateKey(dateKey)) continue;
      if (!Array.isArray(events)) continue;
      for (const ev of events) {
        const cat = normalizeEventLabel(ev?.category || ev?.type);
        if (buckets[cat]) buckets[cat].push({ ...ev, dateKey });
      }
    }
    for (const k of Object.keys(buckets)) {
      buckets[k].sort((a, b) => {
        const byDate = (a.dateKey || "").localeCompare(b.dateKey || "");
        if (byDate !== 0) return byDate;
        return (a.time || "").localeCompare(b.time || "");
      });
    }
    const counts = {
      "Study Session": buckets["Study Session"].length,
      Lectures: buckets.Lectures.length,
      Deadlines: buckets.Deadlines.length,
      Exams: buckets.Exams.length,
    };
    return { upcomingByCategory: buckets, categoryCounts: counts };
  }, [eventsByDate]);

  useEffect(() => {
    if (!categoryFilterModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") setCategoryFilterModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [categoryFilterModal]);

  const formatDateKeyForDisplay = (dateKey) => {
    if (!dateKey) return "";
    const d = new Date(`${dateKey}T12:00:00`);
    if (Number.isNaN(d.getTime())) return dateKey;
    return d.toLocaleDateString("default", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!inAppNotificationsEnabled) return;

    const checkReminders = () => {
      const nowMs = Date.now();
      for (const [dateKey, events] of Object.entries(eventsByDate || {})) {
        if (isPastDateKey(dateKey)) continue;
        if (!Array.isArray(events)) continue;

        for (const ev of events) {
          if (!ev?.reminder) continue;
          const reminderDate = new Date(ev.reminder);
          const reminderMs = reminderDate.getTime();
          if (Number.isNaN(reminderMs)) continue;

          // Fire once when reminder time arrives (30s tolerance window).
          if (reminderMs > nowMs || nowMs - reminderMs > 30000) continue;

          const reminderId = ev.id
            ? `${ev.id}:${ev.reminder}`
            : `${dateKey}:${ev.title}:${ev.reminder}`;
          if (notifiedReminderIdsRef.current.has(reminderId)) continue;

          const title = ev.title ? `Reminder: ${ev.title}` : "Calendar Reminder";
          const body = ev.type === "Deadline"
            ? `Deadline at ${formatEventStartEnd(ev)}`
            : `Event at ${formatEventStartEnd(ev)}`;

          const popupId = `${reminderId}:${nowMs}`;
          setInAppNotifications((prev) => [...prev, { id: popupId, title, body }]);
          window.setTimeout(() => {
            setInAppNotifications((prev) => prev.filter((item) => item.id !== popupId));
          }, 6000);
          notifiedReminderIdsRef.current.add(reminderId);
        }
      }
    };

    checkReminders();
    const timerId = window.setInterval(checkReminders, 15000);
    return () => window.clearInterval(timerId);
  }, [eventsByDate, inAppNotificationsEnabled]);

  const getEventColor = (eventLike) => {
    const normalized = normalizeEventLabel(eventLike?.category || eventLike?.type);
    switch (normalized) {
      case "Study Session":
        return "bg-[#FFECC0] text-[#B500B2] border-l-[3px] border-[#B500B2]";
      case "Lectures":
        return "bg-[#fff3cd] text-[#856404] border-l-[3px] border-[#f97316]";
      case "Deadlines":
        return "bg-[#d1fae5] text-[#065f46] border-l-[3px] border-[#10b981]";
      case "Exams":
        return "bg-[#f4e8dc] text-[#4a3224] border-l-[3px] border-[#8C5A3C]";
      default:
        return "bg-[#ede9fe] text-[#5b21b6] border-l-[3px] border-[#8b5cf6]";
    }
  };

  return (
    <div className="flex h-screen bg-[#28244d] font-sans">

      {/* Sidebar */}
      <div className="w-[280px] bg-[#3C436B] border-r border-[#e9eef2] p-6 overflow-y-auto">

        <div className="text-3xl font-bold text-[#ffffff] mb-7">
          📅 Schedule & Reminder
        </div>

        {/* Mini Calendar */}
        <div>
          <h3 className="text-base font-semibold text-[#f8f8f9] mb-4">
            {monthName} {year}
          </h3>

          <div className="grid grid-cols-7 gap-2 text-xs font-medium">
            {dates.map((d) => {
              const dateObj = new Date(year, month, d);
              const key = formatDateKey(dateObj);
              const isToday = key === todayKey;
              const isSelected = key === selectedKey && !isToday;

              return (
                <span
                  key={d}
                  onClick={() => setSelectedDate(dateObj)}
                  className={`text-center p-1 rounded cursor-pointer text-[#f1f2f3]
                    hover:bg-[#272D3E]
                    ${isToday ? "bg-[#f1091c] text-white font-semibold" : ""}
                    ${isSelected ? "bg-[#272D3E] text-white font-semibold" : ""}
                  `}
                >
                  {d}
                </span>
              );
            })}
          </div>
        </div>

        {/* Calendar List */}
        <div className="mt-7">
          <p className="text-[12px] font-semibold text-[#a2a5a8] uppercase mb-3">
            Scheduled
          </p>

          {CATEGORY_ITEMS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setCategoryFilterModal(item.name)}
              className="w-full flex items-center mb-2 px-4 py-[10px] 
                bg-[#696FC7] text-white 
                uppercase tracking-widest text-sm font-medium
                rounded-[10px] border-2 border-dashed
                shadow-[0px_2px_5px_-1px_rgba(50,50,93,0.25),0px_1px_3px_-1px_rgba(0,0,0,0.3)]
                transition-all duration-400
                hover:bg-white hover:text-[#8F8BB6]
                active:bg-[#8F8BB6]"
            >
              <div className="w-4 h-4 rounded mr-3 shrink-0" style={{ background: item.color }} />
              <span className="flex-1 text-left">{item.name}</span>
              <span className="text-xs">{categoryCounts[item.name] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Today Panel */}
        <div className="mt-8 p-4 bg-[#28244d] border border-[#7067b3] rounded-xl">
          <h3 className="text-sm font-semibold mb-2">
            {selectedDate.toDateString()}
          </h3>

          {eventsByDate[selectedKey] ? (
            eventsByDate[selectedKey].map((ev, i) => (
              <div key={i} className={`p-2 rounded mb-2 shadow text-sm ${getEventColor(ev)}`}>
                <strong className="mr-2">{formatEventStartEnd(ev)}</strong>
                {ev.title}
              </div>
            ))
          ) : (
            <p className="text-xs text-[#94a3b8] italic">No events scheduled</p>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8 overflow-y-auto">

        {calendarRulesError ? (
          <div className="mb-4 rounded-xl border border-red-500/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {calendarRulesError}
          </div>
        ) : null}

        <div className="flex justify-between items-center mb-7">
          <div className="flex gap-2 items-center">
            <button onClick={goPrevMonth} className="w-9 h-9 border rounded bg-[#28244d] hover:bg-[#393657]">
              ←
            </button>
            <button onClick={goNextMonth} className="w-9 h-9 border rounded bg-[#28244d] hover:bg-[#393657]">
              →
            </button>
            <button onClick={goToday} className="bg-[#696FC7] text-white px-5 py-2 rounded-full hover:bg-[#8F8BB6]">
              Today
            </button>
            <button
              type="button"
              onClick={() => setInAppNotificationsEnabled((prev) => !prev)}
              className="bg-[#696FC7] text-white px-5 py-2 rounded-full hover:bg-[#8F8BB6] flex items-center gap-2"
            >
              🔔
              {inAppNotificationsEnabled ? "Notifications On" : "Notifications Off"}
            </button>
          </div>

          <h1 className="text-2xl font-bold text-[#ffffff]">
            {monthName} {year}
          </h1>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-[#fffefe] py-2">
              {day}
            </div>
          ))}

          {prevMonthDates.map((date, i) => (
            <div
              key={i}
              className="bg-[#f8fafc] opacity-60 p-2 rounded cursor-pointer hover:shadow-sm transition"
              onClick={(e) => openEventsPopover(e, new Date(year, month - 1, date))}
            >
              {date}
            </div>
          ))}

          {dates.map((date) => {
            const dateObj = new Date(year, month, date);
            const key = formatDateKey(dateObj);
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;

            return (
              <div
                key={date}
                onClick={(e) => openEventsPopover(e, dateObj)}
                className={`bg-[#776ec4] border rounded-xl p-2 min-h-[120px] cursor-pointer
                  hover:shadow-md transition 
                  ${isToday ? "border-[#f1091c] border-2" : isSelected ? "border-[#272D3E] border-2" : "border"}`}
              >
                <span className={`font-semibold block mb-1 ${isToday ? "text-[#f1091c]" : isSelected ? "text-[#272D3E]" : ""}`}>
                  {date}
                </span>

                {eventsByDate[key]?.map((ev, i) => (
                  <div
                    key={i}
                    className={`text-xs p-1 rounded mt-1 ${getEventColor(ev)}`}
                  >
                    <span className="font-semibold mr-1">{ev.time}</span>
                    {ev.title}
                  </div>
                ))}
              </div>
            );
          })}

          {nextMonthDates.map((date, i) => (
            <div
              key={i}
              className="bg-[#B6B4BB] opacity-60 p-2 rounded-xl cursor-pointer hover:shadow-sm transition"
              onClick={(e) => openEventsPopover(e, new Date(year, month + 1, date))}
            >
              {date}
            </div>
          ))}
        </div>

        <CalendarEventsPopover
          dateKey={eventsPopover.dateKey}
          position={eventsPopover.position}
          eventsByDate={eventsByDate}
          onClose={closeEventsPopover}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
        />

        {categoryFilterModal ? (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/55"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-filter-title"
            onClick={() => setCategoryFilterModal(null)}
          >
            <div
              className="w-full max-w-md max-h-[min(70vh,520px)] overflow-hidden rounded-2xl border border-[#5b52b5] bg-[#28244d] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#5b52b5] px-5 py-4">
                <div>
                  <p id="category-filter-title" className="text-lg font-semibold text-white">
                    {categoryFilterModal}
                  </p>
                  <p className="mt-1 text-xs text-[#a89fdd]">
                    Upcoming events only (past days are hidden)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryFilterModal(null)}
                  className="rounded-lg px-2 py-1 text-sm text-[#a89fdd] hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-[min(58vh,440px)] overflow-y-auto px-5 py-4">
                {(upcomingByCategory[categoryFilterModal] || []).length === 0 ? (
                  <p className="text-sm text-[#94a3b8] italic">No upcoming events in this category.</p>
                ) : (
                  <ul className="space-y-2">
                    {upcomingByCategory[categoryFilterModal].map((ev) => (
                      <li
                        key={`${ev.dateKey}-${ev.id ?? ev.time}-${ev.title}`}
                        className={`rounded-lg px-3 py-2 text-sm ${getEventColor(ev)}`}
                      >
                        <div className="text-[11px] font-medium opacity-90">
                          {formatDateKeyForDisplay(ev.dateKey)}
                        </div>
                        <div className="mt-0.5">
                          <span className="font-semibold">{formatEventStartEnd(ev)}</span>
                          <span className="mx-2">·</span>
                          <span>{ev.title}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="fixed top-5 right-5 z-100 space-y-2 pointer-events-none">
          {inAppNotifications.map((n) => (
            <div
              key={n.id}
              className="pointer-events-auto w-[280px] rounded-xl border border-[#5b52b5] bg-[#28244d] px-4 py-3 text-white shadow-xl"
            >
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="mt-1 text-xs text-[#c5bff2]">{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}