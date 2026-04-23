import { useNavigate } from "react-router-dom";
import TaskStreamCard from "./TaskStreamCard";

export default function TaskStream({ tasks = [] }) {
  const navigate = useNavigate();

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    if (a.dueDate && b.dueDate) {
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    } else if (a.dueDate) {
        return -1;
    } else if (b.dueDate) {
        return 1;
    }
    
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
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
