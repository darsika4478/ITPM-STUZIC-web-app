import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import GlassCard from "./GlassCard";

export default function QuickCapture() {
  const [title, setTitle] = useState("");
  const [dueToday, setDueToday] = useState(false);
  const [highPriority, setHighPriority] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAdd = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title: title.trim(),
        description: null,
        dueDate: dueToday ? new Date().toISOString().split("T")[0] : null,
        priority: highPriority ? "High" : "Medium",
        completed: false,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Quick capture failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <GlassCard>
      <h3 className="mb-3 text-sm font-semibold text-white">⚡ Quick Capture</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you need to do?"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-[var(--c1)] outline-none transition focus:border-[var(--c3)]/50"
        />
        <button
          onClick={handleAdd}
          disabled={!title.trim() || saving}
          className="rounded-xl bg-[var(--c3)] px-4 text-lg font-bold text-white transition hover:bg-[var(--c2)] disabled:opacity-30"
        >
          +
        </button>
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
