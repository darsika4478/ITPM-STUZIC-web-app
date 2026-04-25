import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import GlassCard from "./GlassCard";

export default function QuickCapture() {
  const [title, setTitle] = useState("");
  const [isChecklist, setIsChecklist] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);
  const [dueToday, setDueToday] = useState(false);
  const [highPriority, setHighPriority] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const normalizeChecklistItems = (items) =>
    (Array.isArray(items) ? items : [])
      .map((item) => ({
        text: (item?.text || "").trim(),
        checked: Boolean(item?.checked ?? item?.completed),
      }))
      .filter((item) => item.text.length > 0);

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setChecklistItems([...checklistItems, { text: subtaskInput.trim(), checked: false }]);
      setSubtaskInput("");
    }
  };

  const handleRemoveSubtask = (index) => {
    const newItems = [...checklistItems];
    newItems.splice(index, 1);
    setChecklistItems(newItems);
  };

  const handleSubtaskKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || saving) return;
    const user = auth.currentUser;
    if (!user) return;

    const normalizedChecklist = normalizeChecklistItems(checklistItems);
    if (isChecklist && normalizedChecklist.length === 0) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title: title.trim(),
        description: null,
        contentType: isChecklist ? "checklist" : "note",
        checklistItems: isChecklist ? normalizedChecklist : [],
        isDeleted: false,
        deletedAt: null,
        dueDate: dueToday ? new Date().toISOString().split("T")[0] : null,
        priority: highPriority ? "High" : "Medium",
        completed: false,
        attachedImages: [],
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setChecklistItems([]);
      setSubtaskInput("");
      setIsChecklist(false);
      setDueToday(false);
      setHighPriority(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Quick capture failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isChecklist) handleAdd();
  };
  const canSaveSimple = !!title.trim() && !saving && !!auth.currentUser;
  const canSaveChecklist =
    !!title.trim() && normalizeChecklistItems(checklistItems).length > 0 && !saving && !!auth.currentUser;

  return (
    <GlassCard>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-white">⚡ Quick Capture</h3>
        <div className="flex gap-1.5 rounded-lg bg-black/20 p-1 border border-white/5">
          <button
            onClick={() => setIsChecklist(false)}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition ${!isChecklist ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/70'}`}
          >
            📝 Simple
          </button>
          <button
            onClick={() => setIsChecklist(true)}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition ${isChecklist ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/70'}`}
          >
            ☑️ Checklist
          </button>
        </div>
      </div>
      <div className={`flex ${!isChecklist ? 'gap-2' : 'flex-col gap-3'}`}>
        <div className={`${isChecklist ? 'flex gap-2' : 'flex-1 flex gap-2'}`}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you need to do?"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-[var(--c1)] outline-none transition focus:border-[var(--c3)]/50"
          />
          {!isChecklist && (
            <button
              onClick={handleAdd}
              disabled={!canSaveSimple}
              className="rounded-xl bg-[var(--c3)] px-4 text-lg font-bold text-white transition hover:bg-[var(--c2)] disabled:opacity-30"
            >
              +
            </button>
          )}
        </div>
        
        {isChecklist && (
          <div className="rounded-xl border border-white/5 bg-black/20 p-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--c1)] mb-2">Checklist Items</h4>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={handleSubtaskKeyDown}
                placeholder="Add a subtask..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 outline-none transition focus:border-[var(--c3)]/50"
              />
              <button
                onClick={handleAddSubtask}
                disabled={!subtaskInput.trim()}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-30"
              >
                Add
              </button>
            </div>
            
            {checklistItems.length > 0 ? (
              <ul className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1 mb-3">
                {checklistItems.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-1.5 border border-white/5">
                    <span className="text-xs text-white/90 truncate">{item.text}</span>
                    <button
                      onClick={() => handleRemoveSubtask(idx)}
                      className="ml-2 text-red-400 hover:text-red-300 transition-colors text-[10px] rounded p-1 hover:bg-black/20"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[10px] text-white/30 mb-3 italic">No items added yet.</p>
            )}
            
            <button
              onClick={handleAdd}
              disabled={!canSaveChecklist}
              className="w-full rounded-lg bg-[var(--c3)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--c2)] disabled:opacity-30"
            >
              {saving ? 'Saving...' : 'Save Checklist Task'}
            </button>
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setDueToday(!dueToday)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            dueToday ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-[var(--c1)] hover:bg-white/10"
          }`}
        >
          📅 Due Today
        </button>
        <button
          onClick={() => setHighPriority(!highPriority)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            highPriority ? "bg-red-500/20 text-red-400" : "bg-white/5 text-[var(--c1)] hover:bg-white/10"
          }`}
        >
          🔴 High Priority
        </button>
      </div>
      {showSuccess && (
        <p className="mt-2 text-xs font-medium text-green-400">✅ Task added!</p>
      )}
    </GlassCard>
  );
}
