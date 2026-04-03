import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

const priorityColor = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-green-500",
};

export default function TaskStreamCard({ task }) {
  const now = new Date();
  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date(now.toDateString());

  const formatDate = (d) => {
    if (!d) return "No deadline";
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleToggle = async () => {
    try {
      await updateDoc(doc(db, "tasks", task.id), { completed: !task.completed });
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  return (
    <div
      className={`relative flex min-w-[200px] max-w-[220px] flex-shrink-0 flex-col justify-between rounded-2xl border bg-white/5 p-4 backdrop-blur transition ${
        isOverdue ? "animate-pulse border-red-500/50" : "border-white/10"
      }`}
    >
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${priorityColor[task.priority] || "bg-gray-500"}`} />
      <div className="pl-2">
        <p className={`truncate text-sm font-medium text-white ${task.completed ? "line-through opacity-50" : ""}`}>
          {task.title}
        </p>
        <p className="mt-1 text-[10px] text-[var(--c1)]">📅 {formatDate(task.dueDate)}</p>
      </div>
      <button
        onClick={handleToggle}
        className="mt-3 self-end rounded-lg border border-white/10 px-2 py-1 text-[10px] text-[var(--c1)] transition hover:bg-white/10"
      >
        {task.completed ? "✅ Done" : "☐ Mark"}
      </button>
    </div>
  );
}
