// SessionHistory.jsx – displays list of past focus sessions
import { DUMMY_SESSIONS } from "../../data/dummyTracks";

const MOOD_EMOJI = {
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
      <div style={styles.empty}>
        <p style={{ color: "var(--c-accent)", fontSize: 14 }}>No sessions recorded yet. Start a focus session above! 🚀</p>
      </div>
    );
  }

  const totalMinutes = data.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.heading}>Session History</h3>
        <span style={styles.totalBadge}>🏆 {totalMinutes} min total</span>
      </div>

      {/* Session list */}
      <div style={styles.list}>
        {data.map((session) => (
          <div key={session.id} style={styles.sessionCard}>
            {/* Left: mood emoji + mood label */}
            <div style={styles.left}>
              <span style={styles.moodEmoji}>
                {MOOD_EMOJI[session.mood?.toLowerCase()] || "🎵"}
              </span>
              <div>
                <p style={styles.trackName}>{session.trackTitle || "Unknown Track"}</p>
                <p style={styles.moodLabel}>{session.mood || "—"}</p>
              </div>
            </div>

            {/* Right: stats */}
            <div style={styles.right}>
              <span style={styles.duration}>⏱ {session.durationMinutes ?? "?"} min</span>
              <span style={styles.date}>{formatDate(session.startTime)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: "var(--c-surface)",
    borderRadius: 16,
    border: "1px solid rgba(143,139,182,0.2)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(143,139,182,0.15)",
  },
  heading: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "var(--c-text)",
  },
  totalBadge: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--c-accent)",
    background: "rgba(143,139,182,0.12)",
    padding: "3px 10px",
    borderRadius: 20,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  sessionCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid rgba(143,139,182,0.08)",
    transition: "background 0.15s",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  moodEmoji: {
    fontSize: 26,
    lineHeight: 1,
  },
  trackName: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "var(--c-text)",
  },
  moodLabel: {
    margin: 0,
    fontSize: 12,
    color: "var(--c-accent)",
    textTransform: "capitalize",
  },
  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  duration: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--c-text)",
  },
  date: {
    fontSize: 11,
    color: "rgba(182,180,187,0.5)",
  },
  empty: {
    padding: "32px 24px",
    textAlign: "center",
    background: "var(--c-surface)",
    borderRadius: 16,
    border: "1px solid rgba(143,139,182,0.2)",
  },
};
