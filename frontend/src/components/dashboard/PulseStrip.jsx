import DayColumn from "./DayColumn";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PulseStrip({ moods = [], tasks = [] }) {
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayMood = moods.find((m) => m.date === dateStr);
    const dayTasks = tasks.filter(
      (t) => t.completed && t.dueDate === dateStr
    ).length;

    days.push({
      label: i === 0 ? "Today" : DAY_LABELS[d.getDay()],
      isToday: i === 0,
      isFuture: false,
      mood: dayMood || null,
      tasksCompleted: dayTasks,
    });
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {days.map((day, idx) => (
        <DayColumn key={idx} {...day} />
      ))}
    </div>
  );
}
