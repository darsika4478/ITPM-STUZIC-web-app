import { useNavigate } from "react-router-dom";
import GlassCard from "./GlassCard";

const categoryColors = {
  work: "bg-blue-500",
  personal: "bg-amber-500",
  education: "bg-green-500",
};

// Hardcoded events matching CalendarUI.jsx structure — will migrate to Firestore later
const EVENTS = {
  "2026-03-25": [
    { time: "09:00", title: "Design Meeting", category: "work" },
    { time: "14:00", title: "Client Call", category: "work" },
  ],
  "2026-03-26": [
    { time: "10:00", title: "Study Session", category: "education" },
    { time: "15:00", title: "Team Standup", category: "work" },
  ],
  "2026-03-27": [
    { time: "13:00", title: "Group Work", category: "education" },
  ],
  "2026-03-28": [
    { time: "07:30", title: "Breakfast", category: "personal" },
    { time: "16:00", title: "DB Lecture", category: "education" },
  ],
  "2026-03-30": [
    { time: "10:30", title: "Design Review", category: "work" },
    { time: "16:30", title: "Bootcamp Session", category: "education" },
  ],
};

export default function UpcomingSchedule() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];

  // Gather upcoming events from today onward
  const upcoming = [];
  Object.entries(EVENTS)
    .filter(([date]) => date >= todayStr)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, evts]) => {
      evts.forEach((evt) => {
        upcoming.push({ ...evt, date });
      });
    });

  const display = upcoming.slice(0, 3);

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-white">📅 Coming Up</h3>
      {display.length === 0 ? (
        <div className="mt-4 flex flex-col items-center py-4 text-center">
          <span className="text-3xl">📭</span>
          <p className="mt-2 text-sm text-[var(--c1)]">No upcoming events. Add one in Schedule →</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {display.map((evt, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${categoryColors[evt.category] || "bg-purple-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-white">{evt.title}</p>
                <p className="text-[10px] text-[var(--c1)]">
                  {new Date(evt.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {evt.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => navigate("/dashboard/calendar")}
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-[var(--c1)] transition hover:bg-white/10 hover:text-white"
      >
        View Calendar →
      </button>
    </GlassCard>
  );
}
