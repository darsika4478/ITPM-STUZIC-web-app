// SessionHistory.jsx – displays list of past focus sessions
import { DUMMY_SESSIONS } from "../../data/dummyTracks";

const MOOD_EMOJI = {
  sad:      "😔",
  low:      "😞",
  neutral:  "😐",
  good:     "🙂",
  happy:    "😄",
  // fallbacks for old data
  focus:    "🎯",
  chill:    "😌",
  deepwork: "💪",
  relax:    "🌿",
  night:    "🌙",
};

function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SessionHistory({ sessions }) {
  // Use passed sessions if available, otherwise fall back to dummy data
  const data = (sessions && sessions.length > 0) ? sessions : DUMMY_SESSIONS;

  if (!data || data.length === 0) {
    return (
      <div className="py-8 px-6 text-center bg-[#3C436B] rounded-2xl border border-[#8F8BB6]/20">
        <p className="text-[#8F8BB6] text-sm m-0">No sessions recorded yet. Start a focus session above! 🚀</p>
      </div>
    );
  }

  const totalMinutes = data.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  return (
    <div className="bg-[#3C436B] rounded-2xl border border-[#8F8BB6]/20 overflow-hidden shadow-lg w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#8F8BB6]/15 bg-gradient-to-r from-[#3C436B] to-[#585296]/20">
        <h3 className="m-0 text-[15px] font-bold text-white">Session History</h3>
        <span className="text-xs font-semibold text-[#8F8BB6] bg-[#8F8BB6]/10 px-3 py-1 rounded-full">
          🏆 {totalMinutes} min total
        </span>
      </div>

      {/* Session list */}
      <div className="flex flex-col max-h-[400px] overflow-y-auto">
        {data.map((session) => (
          <div key={session.id} className="flex items-center justify-between px-5 py-3.5 border-b border-[#8F8BB6]/5 last:border-0 hover:bg-[#8F8BB6]/10 transition-colors">
            
            {/* Left: mood emoji + mood label */}
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none">
                {MOOD_EMOJI[session.mood?.toLowerCase()] || "🎵"}
              </span>
              <div className="flex flex-col">
                <p className="m-0 text-sm font-semibold text-[#B6B4BB] truncate max-w-[140px] sm:max-w-xs">
                  {session.trackTitle || "Unknown Track"}
                </p>
                <p className="m-0 text-xs text-[#8F8BB6] capitalize">
                  {session.mood || "—"}
                </p>
              </div>
            </div>

            {/* Right: stats */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[13px] font-semibold text-[#B6B4BB]">
                ⏱ {session.durationMinutes ?? "?"} min
              </span>
              <span className="text-[11px] text-[#B6B4BB]/50">
                {formatDate(session.startTime)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
