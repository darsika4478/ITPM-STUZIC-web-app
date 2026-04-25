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
  const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
  const isChecklistItemDone = (item) => Boolean(item?.checked ?? item?.completed);

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

  const handleToggleSubtask = async (index, e) => {
    e.stopPropagation();
    try {
      const newChecklist = checklistItems.map((item) => ({ ...item }));
      const targetItem = newChecklist[index];
      if (!targetItem) return;

      const nextChecked = !isChecklistItemDone(targetItem);
      newChecklist[index] = { ...targetItem, checked: nextChecked };
      if ("completed" in targetItem) {
        delete newChecklist[index].completed;
      }
      
      const allCompleted = newChecklist.length > 0 && newChecklist.every((i) => isChecklistItemDone(i));
      
      await updateDoc(doc(db, "tasks", task.id), { 
          checklistItems: newChecklist,
          completed: allCompleted
      });
    } catch (err) {
      console.error("Toggle subtask failed:", err);
    }
  };

  const getTaskTitle = (t) => {
    const titleText = (t.title || "").trim();
    if (titleText) return titleText;
    
    if (Array.isArray(t.checklistItems) && t.checklistItems.length > 0) {
      const firstChecklist = t.checklistItems.find((item) => (item.text || "").trim());
      if (firstChecklist?.text) return firstChecklist.text.trim();
    }
    return "Untitled task";
  };

  const isChecklist = task.contentType === "checklist";
  const descriptionPreview = !isChecklist && (task.description || "").trim();
  const imagePreviews = Array.isArray(task.attachedImages) && task.attachedImages.length > 0
    ? task.attachedImages
    : task.attachedImage
      ? [task.attachedImage]
      : [];
  const completedSubtasksCount = checklistItems.length > 0
    ? checklistItems.filter((i) => isChecklistItemDone(i)).length 
    : 0;
  const totalSubtasksCount = checklistItems.length > 0
    ? checklistItems.length 
    : 0;

  return (
    <div
      className={`relative flex min-w-[200px] max-w-[220px] flex-shrink-0 flex-col justify-between rounded-2xl border bg-white/5 p-4 backdrop-blur transition ${
        isOverdue ? "animate-pulse border-red-500/50" : "border-white/10"
      }`}
    >
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${priorityColor[task.priority] || "bg-gray-500"}`} />
      <div className="pl-2 flex-grow flex flex-col min-h-0">
        <p className={`truncate text-sm font-medium text-white ${task.completed ? "line-through opacity-50" : ""}`}>
          {getTaskTitle(task)}
        </p>

        {descriptionPreview && (
          <p className={`mt-2 text-xs leading-relaxed text-[var(--c1)] ${task.completed ? "line-through opacity-50" : "opacity-85"}`}>
            {descriptionPreview.length > 90 ? `${descriptionPreview.slice(0, 90)}...` : descriptionPreview}
          </p>
        )}
        
        {isChecklist && totalSubtasksCount > 0 && (
          <div className="mt-2 flex flex-col gap-1.5 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--c1)] font-semibold uppercase tracking-wider">Subtasks</span>
              <span className={`text-[10px] ${completedSubtasksCount === totalSubtasksCount ? 'text-green-400' : 'text-[var(--c3)]'}`}>
                {completedSubtasksCount}/{totalSubtasksCount}
              </span>
            </div>
            {checklistItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-1.5 group cursor-pointer" onClick={(e) => handleToggleSubtask(idx, e)}>
                <div className={`flex-shrink-0 mt-0.5 w-3 h-3 rounded-sm border ${isChecklistItemDone(item) ? 'bg-[var(--c3)] border-[var(--c3)]' : 'border-white/30 group-hover:border-white/50'} flex items-center justify-center transition-colors`}>
                  {isChecklistItemDone(item) && <span className="text-white text-[8px] leading-none">✓</span>}
                </div>
                <span className={`text-xs truncate ${isChecklistItemDone(item) ? 'text-white/40 line-through' : 'text-white/80 group-hover:text-white'} transition-colors`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {imagePreviews.length > 0 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {imagePreviews.slice(0, 3).map((src, idx) => (
              <img
                key={`${task.id}-img-${idx}`}
                src={src}
                alt="Attached"
                className="h-10 w-10 flex-shrink-0 rounded-md border border-white/10 object-cover"
              />
            ))}
          </div>
        )}
        
        <p className="mt-auto pt-2 text-[10px] text-[var(--c1)]">📅 {formatDate(task.dueDate)}</p>
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
