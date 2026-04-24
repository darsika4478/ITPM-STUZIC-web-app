// EnhancedNowPlayingCard.jsx – displays current track with enhanced styling and animations
const MOOD_COLORS = {
  sad:     { bg: "#585296", label: "Sad" },
  low:     { bg: "#7B7BA8", label: "Low" },
  neutral: { bg: "#8F8BB6", label: "Neutral" },
  good:    { bg: "#A89FCC", label: "Good" },
  happy:   { bg: "#C4BAE8", label: "Happy" },
};

export default function EnhancedNowPlayingCard({ track, mood, isPlaying, isSessionActive = false }) {
  const moodMeta = MOOD_COLORS[mood?.toLowerCase()] || MOOD_COLORS.neutral;

  const formatDuration = (secs) => {
    if (!secs) return "0:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full flex flex-col items-center gap-7">
      {/* Now Playing Header */}
      {isSessionActive && (
        <div className="text-center mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8F8BB6]">
            ♪ Now Playing
          </p>
        </div>
      )}

      {/* Album artwork container with enhanced styling */}
      <div className="relative w-full max-w-xs">
        {/* Gradient background glow */}
        <div 
          className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
          style={{
            background: `linear-gradient(135deg, ${moodMeta.bg}44 0%, ${moodMeta.bg}22 100%)`,
            transform: "scale(1.1)"
          }}
        />

        {/* Main album art card */}
        <div
          className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out border border-white/10 ${
            isSessionActive && isPlaying ? "hover:scale-105 hover:shadow-[0_20px_60px_rgba(143,139,182,0.4)]" : ""
          }`}
          style={{
            aspectRatio: "1",
            background: `linear-gradient(135deg, ${moodMeta.bg} 0%, ${moodMeta.bg}dd 100%)`,
          }}
        >
          {/* Animated waveform when playing */}
          {isPlaying && isSessionActive && (
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-50">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-white/80 rounded-full"
                  style={{
                    height: `${20 + Math.random() * 40}%`,
                    animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Music note icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className={`text-7xl transition-transform duration-500 ${
                isPlaying && isSessionActive ? "animate-spin" : ""
              }`}
              style={{
                animationDuration: isPlaying ? "8s" : "0s",
                opacity: "0.95"
              }}
            >
              ♪
            </span>
          </div>

          {/* Glowing ring effect */}
          {isPlaying && isSessionActive && (
            <div
              className="absolute inset-0 border-2 border-white/20 rounded-3xl pointer-events-none"
              style={{
                boxShadow: `0 0 40px 10px rgba(255,255,255,0.15), inset 0 0 40px 10px rgba(255,255,255,0.05)`,
                animation: "glowPulse 2s ease-in-out infinite"
              }}
            />
          )}
        </div>
      </div>

      {/* Track information */}
      <div className="flex flex-col items-center gap-3 text-center w-full px-4">
        {/* Track title */}
        <h2 className="text-2xl font-bold text-white m-0 line-clamp-2">
          {isSessionActive && track ? track.title : "Ready to Start"}
        </h2>

        {/* Artist name */}
        {track && isSessionActive && (
          <p className="text-sm text-[#B6B4BB]/80 m-0 line-clamp-1">
            {track.artist || "Unknown Artist"}
          </p>
        )}

        {/* Mood badge */}
        {isSessionActive && (
          <div className="flex items-center gap-2 justify-center mt-1">
            <span 
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: moodMeta.bg }}
            >
              {moodMeta.label}
            </span>
          </div>
        )}

        {/* Duration */}
        {track && isSessionActive && (
          <p className="text-xs text-[#8F8BB6] m-0 font-mono">
            {formatDuration(track.duration)}
          </p>
        )}

        {/* Empty state message */}
        {!isSessionActive && (
          <p className="text-xs text-[#8F8BB6]/60 m-0">
            Start a session to begin playing
          </p>
        )}
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 30px 5px rgba(255,255,255,0.1), inset 0 0 30px 5px rgba(255,255,255,0.02);
          }
          50% {
            box-shadow: 0 0 50px 15px rgba(255,255,255,0.2), inset 0 0 50px 10px rgba(255,255,255,0.05);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin linear infinite;
        }

        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}
