import { useNavigate } from "react-router-dom";
import TaskStreamCard from "./TaskStreamCard";

export default function TaskStream({ tasks = [] }) {
  const navigate = useNavigate();
  const now = new Date();

  const sorted = [...tasks].sort((a, b) => {
    const aOverdue = !a.completed && a.dueDate && new Date(a.dueDate) < new Date(now.toDateString());
    const bOverdue = !b.completed && b.dueDate && new Date(b.dueDate) < new Date(now.toDateString());
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

    const todayStr = now.toISOString().split("T")[0];
    const aDueToday = a.dueDate === todayStr;
    const bDueToday = b.dueDate === todayStr;
    if (aDueToday !== bDueToday) return aDueToday ? -1 : 1;

    const prio = { High: 0, Medium: 1, Low: 2 };
    return (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3);
  });

  const visible = sorted.filter((t) => !t.completed).slice(0, 8);
  const remaining = sorted.filter((t) => !t.completed).length - visible.length;

  if (visible.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        <div className="flex min-w-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center backdrop-blur">
          <span className="text-3xl">✨</span>
          <p className="mt-2 text-sm text-[var(--c1)]">All clear! Add a task below ↓</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
      {visible.map((task) => (
        <TaskStreamCard key={task.id} task={task} />
      ))}
      {remaining > 0 && (
        <button
          onClick={() => navigate("/dashboard/tasks")}
          className="flex min-w-[120px] flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-[var(--c3)]/30 bg-[var(--c3)]/5 px-4 text-sm font-semibold text-[var(--c3)] transition hover:bg-[var(--c3)]/10"
        >
          +{remaining} more →
        </button>
      )}
    </div>
  );
}
