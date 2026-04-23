import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import GlassCard from "./GlassCard";

const priorityColor = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-green-500",
};

export default function TodayLineup({ tasks = [] }) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const todayFormatted = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const activeTasks = tasks.filter((t) => !t.isDeleted);

  const todayTasks = activeTasks.filter((t) => t.dueDate === todayStr);
  const doneToday = activeTasks.filter((t) => t.completed && t.dueDate === todayStr).length;
  const overdue = activeTasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date(now.toDateString());
  }).length;

  const handleToggle = async (task) => {
    try {
      await updateDoc(doc(db, "tasks", task.id), { completed: !task.completed });
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const getTaskTitle = (t) => {
    const titleText = (t.title || "").trim();
    if (titleText) return titleText;
    
    const normalizedChecklist = Array.isArray(t.checklistItems)
      ? t.checklistItems.filter((item) => (item?.text || "").trim())
      : [];
    if (normalizedChecklist.length > 0) {
      const firstChecklist = normalizedChecklist.find((item) => (item.text || "").trim());
      if (firstChecklist?.text) return firstChecklist.text.trim();
    }
    return "Untitled task";
  };

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-white">📅 Today — {todayFormatted}</h3>
      {todayTasks.length === 0 ? (
        <div className="mt-4 flex flex-col items-center py-4 text-center">
          <span className="text-3xl">🎉</span>
          <p className="mt-2 text-sm text-[var(--c1)]">Nothing due today</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {todayTasks.slice(0, 4).map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 transition hover:bg-white/5">
              <button onClick={() => handleToggle(task)} className="text-sm">
                {task.completed ? "✅" : "☐"}
              </button>
              <p className={`flex-1 truncate text-sm text-white ${task.completed ? "line-through opacity-50" : ""}`}>
                {getTaskTitle(task)}
              </p>
              <span className={`h-2 w-2 rounded-full ${priorityColor[task.priority] || "bg-gray-500"}`} />
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-3">
        <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-medium text-green-400">
          ✅ {doneToday} done today
        </span>
        <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-medium text-red-400">
          🔥 {overdue} overdue
        </span>
      </div>
    </GlassCard>
  );
}
