import { useNavigate } from "react-router-dom";
import GlassCard from "./GlassCard";

const getVibeLabel = (mood, activity) => {
  if (activity === "studying" && mood >= 3) return "Lofi Focus";
  if (activity === "studying" && mood < 3) return "Calm Ambient";
  if (activity === "workingout") return "High Energy Beats";
  if (activity === "relaxing" && mood >= 4) return "Chill Vibes";
  if (activity === "relaxing" && mood < 4) return "Mellow Acoustic";
  if (activity === "commuting") return "Upbeat Mix";
  return "Study Sounds";
};

export default function SoundtrackCard({ todayMood }) {
  const navigate = useNavigate();

  if (!todayMood) {
    return (
      <GlassCard className="flex flex-col items-center justify-center text-center opacity-60">
        <span className="text-4xl opacity-50">🎵</span>
        <p className="mt-3 text-sm text-[var(--c1)]">Log your mood to unlock today's vibe</p>
      </GlassCard>
    );
  }

  const vibe = getVibeLabel(todayMood.mood, todayMood.activity);

  return (
    <GlassCard>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--c2)]">
        🎧 Today's Vibe
      </p>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--c3)] to-[var(--c2)] text-2xl shadow-lg shadow-[var(--c3)]/30">
          🎵
        </div>
        <div>
          <span className="inline-block rounded-full bg-[var(--c3)]/20 px-3 py-1 text-sm font-bold text-[var(--c2)]">
            {vibe}
          </span>
          <p className="mt-1 text-xs capitalize text-[var(--c1)]">
            {todayMood.activity === "workingout" ? "Working Out" : todayMood.activity} mode
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/dashboard/mood")}
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-[var(--c1)] transition hover:bg-white/10 hover:text-white"
      >
        🎵 Full Music Profile →
      </button>
    </GlassCard>
  );
}
