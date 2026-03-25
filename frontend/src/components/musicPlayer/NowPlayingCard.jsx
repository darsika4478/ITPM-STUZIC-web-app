// NowPlayingCard.jsx – displays current track info with animated album art

const MOOD_COLORS = {
  focus:    { bg: "#585296", label: "Focus" },
  chill:    { bg: "#3C6B5A", label: "Chill" },
  deepwork: { bg: "#6B3C3C", label: "Deep Work" },
  relax:    { bg: "#3C5A6B", label: "Relax" },
  night:    { bg: "#2D2745", label: "Night Study" },
};

export default function NowPlayingCard({ track, mood, isPlaying }) {
  const moodMeta = MOOD_COLORS[mood?.toLowerCase()] || MOOD_COLORS.focus;

  const formatDuration = (secs) => {
    if (!secs) return "0:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div style={styles.card}>
      {/* Album art placeholder */}
      <div style={{ ...styles.albumArt, animation: isPlaying ? "spin 8s linear infinite" : "none" }}>
        <div style={styles.albumInner}>
          <span style={styles.musicNote}>♪</span>
        </div>
      </div>

      {/* Track info */}
      <div style={styles.info}>
        <span
          style={{ ...styles.moodBadge, background: moodMeta.bg }}
        >
          {moodMeta.label}
        </span>
        <h2 style={styles.title}>{track?.title || "No Track Selected"}</h2>
        <p style={styles.artist}>{track?.artist || "—"}</p>
        <p style={styles.duration}>{formatDuration(track?.duration)}</p>
      </div>

      {/* Spin animation via injected style tag */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 12px 2px rgba(143,139,182,0.3); }
          50%       { box-shadow: 0 0 24px 6px rgba(143,139,182,0.6); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
    padding: "32px 24px 24px",
    background: "var(--c-surface)",
    borderRadius: 20,
    border: "1px solid rgba(143,139,182,0.2)",
  },
  albumArt: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--c-primary) 0%, var(--c-accent) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 24px 4px rgba(143,139,182,0.4)",
    animation: "pulse-glow 2s ease-in-out infinite",
    flexShrink: 0,
  },
  albumInner: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "var(--c-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  musicNote: {
    fontSize: 24,
    color: "var(--c-accent)",
  },
  info: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  moodBadge: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#fff",
    padding: "3px 10px",
    borderRadius: 20,
    marginBottom: 4,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "var(--c-text)",
    letterSpacing: 0.3,
  },
  artist: {
    margin: 0,
    fontSize: 14,
    color: "var(--c-accent)",
  },
  duration: {
    margin: 0,
    fontSize: 12,
    color: "rgba(182,180,187,0.5)",
  },
};
