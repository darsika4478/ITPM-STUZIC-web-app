import { useNavigate } from "react-router-dom";
import GlassCard from "./GlassCard";

const MOOD_EMOJI = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

export default function StreakStats({ moods = [], tasks = [] }) {
  const navigate = useNavigate();

  // Mood streak: consecutive days with a mood entry going backwards from today
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (moods.some((m) => m.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  // Average mood last 7 days
  const last7 = moods.filter((m) => {
    const d = new Date(m.date);
    const diff = (today - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const avgMood = last7.length > 0 ? (last7.reduce((s, m) => s + m.mood, 0) / last7.length) : 0;
  const avgRounded = Math.round(avgMood);

  // Tasks done this week
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const tasksDoneThisWeek = tasks.filter((t) => t.completed && t.dueDate >= weekStartStr).length;

  // Most active day
  const dayCounts = {};
  tasks.filter((t) => t.completed && t.dueDate).forEach((t) => {
    const day = new Date(t.dueDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-white">🔥 Streak & Stats</h3>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--c1)]">Mood Streak</span>
          <span className="text-sm font-bold text-white">{streak} day{streak !== 1 ? "s" : ""} 🔥</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--c1)]">Avg Mood (7d)</span>
          <span className="text-sm font-bold text-white">
            {avgRounded > 0 ? `${MOOD_EMOJI[avgRounded]} ${avgMood.toFixed(1)}/5` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--c1)]">Tasks Done This Week</span>
          <span className="text-sm font-bold text-white">{tasksDoneThisWeek}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--c1)]">Most Active Day</span>
          <span className="text-sm font-bold text-white">{mostActiveDay}</span>
        </div>
      </div>
      <button
        onClick={() => navigate("/dashboard/mood-analytics")}
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-[var(--c1)] transition hover:bg-white/10 hover:text-white"
      >
        View Full Analytics →
      </button>
    </GlassCard>
  );
}
