const MOOD_EMOJI = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

export default function DayColumn({ label, isToday, isFuture, mood, energy, tasksCompleted }) {
  return (
    <div
      className={`flex flex-1 min-w-[80px] flex-col items-center gap-1.5 rounded-2xl border p-3 transition ${
        isToday
          ? "border-[var(--c3)] bg-[var(--c3)]/10 shadow-[0_0_12px_rgba(109,95,231,0.3)]"
          : isFuture
          ? "border-white/5 opacity-30"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-[var(--c2)]" : "text-[var(--c1)]"}`}>
        {label}
      </span>
      <span className="text-2xl">{mood ? MOOD_EMOJI[mood.mood] || "—" : "—"}</span>
      {mood ? (
        <div className="flex gap-0.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-3 rounded-full ${
                i <= Math.ceil(((mood.energy || 3) / 5) * 3) ? "bg-[var(--c3)]" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="h-1.5" />
      )}
      <span className="text-[10px] text-[var(--c1)]">
        {tasksCompleted > 0 ? `${tasksCompleted}✅` : "—"}
      </span>
    </div>
  );
}
