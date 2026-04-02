// NowPlayingCard.jsx – displays current track info with enlarged animated album art

const MOOD_COLORS = {
  sad:     { bg: "#585296", label: "Sad" },
  low:     { bg: "#7B7BA8", label: "Low" },
  neutral: { bg: "#8F8BB6", label: "Neutral" },
  good:    { bg: "#A89FCC", label: "Good" },
  happy:   { bg: "#C4BAE8", label: "Happy" },
};

export default function NowPlayingCard({ track, mood, isPlaying }) {
  const moodMeta = MOOD_COLORS[mood?.toLowerCase()] || MOOD_COLORS.neutral;

  const formatDuration = (secs) => {
    if (!secs) return "0:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div style={styles.card}>
      {/* Enlarged Album art with glow effect */}
      <div style={{ ...styles.artworkContainer }}>
        <div style={{ ...styles.albumArt, animation: isPlaying ? "spin 12s linear infinite" : "none" }}>
          <div style={styles.albumInner}>
            <span style={styles.musicNote}>♪</span>
          </div>
        </div>
        {/* Glow effect ring */}
        <div style={{ ...styles.glowRing, animation: isPlaying ? "glowPulse 3s ease-in-out infinite" : "none" }} />
      </div>

      {/* Track info - Hierarchy: Track Name -> Category -> Duration */}
      <div style={styles.infoContainer}>
        <h2 style={styles.title}>{track?.title || "No Track Selected"}</h2>
        <span style={{ ...styles.moodBadge, background: moodMeta.bg }}>
          {moodMeta.label}
        </span>
        <p style={styles.duration}>{formatDuration(track?.duration)}</p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { 
            box-shadow: 0 0 30px 6px rgba(143, 139, 182, 0.4);
            opacity: 0.7;
          }
          50% {
            box-shadow: 0 0 60px 12px rgba(143, 139, 182, 0.6);
            opacity: 1;
          }
        }
        @keyframes softGlow {
          0%, 100% {
            box-shadow: 0 0 0 1px rgba(143, 139, 182, 0.2),
                        0 12px 40px rgba(88, 82, 150, 0.4),
                        0 0 80px rgba(143, 139, 182, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }
          50% {
            box-shadow: 0 0 0 1px rgba(143, 139, 182, 0.3),
                        0 16px 50px rgba(88, 82, 150, 0.5),
                        0 0 100px rgba(143, 139, 182, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.08);
          }
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
    gap: "28px",
    width: "100%",
  },
  artworkContainer: {
    position: "relative",
    width: "320px",
    height: "320px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "100%",
  },
  albumArt: {
    width: "320px",
    height: "320px",
    borderRadius: "32px",
    background: "linear-gradient(135deg, var(--c-primary) 0%, var(--c-accent) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `
      0 0 0 1px rgba(143, 139, 182, 0.2),
      0 20px 50px rgba(0, 0, 0, 0.4),
      0 0 80px rgba(143, 139, 182, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    animation: "softGlow 5s ease-in-out infinite",
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.4s ease-out",
  },
  glowRing: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    border: "2px solid rgba(143, 139, 182, 0.15)",
    pointerEvents: "none",
  },
  albumInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
  },
  musicNote: {
    fontSize: "90px",
    color: "rgba(255, 255, 255, 0.95)",
    textShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
  },
  infoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    textAlign: "center",
    width: "100%",
  },
  title: {
    margin: "0",
    fontSize: "24px",
    fontWeight: "900",
    color: "var(--c-text)",
    lineHeight: "1.2",
    wordWrap: "break-word",
    letterSpacing: "0.5px",
  },
  moodBadge: {
    padding: "5px 12px",
    borderRadius: "12px",
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "2px",
    boxShadow: "0 4px 12px rgba(88, 82, 150, 0.2)",
  },
  duration: {
    margin: "0",
    fontSize: "12px",
    color: "rgba(182, 180, 187, 0.4)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "700",
  },
};
