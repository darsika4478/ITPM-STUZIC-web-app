// SessionTimer.jsx – Pomodoro-style focus / break timer UI
import { useSessionTimer } from "../../hooks/useSessionTimer";

const PHASE_COLORS = {
  focus: "var(--c-primary)",
  break: "#3C6B5A",
};

export default function SessionTimer({ onSessionEnd }) {
  const {
    phase,
    formattedTime,
    isRunning,
    completedFocusCount,
    elapsedFocusMinutes,
    sessionStartTime,
    start,
    pause,
    reset,
  } = useSessionTimer();

  const handleEnd = () => {
    if (onSessionEnd) {
      onSessionEnd({
        sessionStartTime,
        elapsedFocusMinutes,
        completedFocusCount,
      });
    }
    reset();
  };

  const phaseLabel = phase === "focus" ? "🎯 Focus Time" : "☕ Break Time";
  const progressDeg = phase === "focus"
    ? (1 - (parseInt(formattedTime.split(":")[0]) * 60 + parseInt(formattedTime.split(":")[1])) / (25 * 60)) * 360
    : (1 - (parseInt(formattedTime.split(":")[0]) * 60 + parseInt(formattedTime.split(":")[1])) / (5 * 60)) * 360;

  return (
    <div style={styles.wrapper}>
      {/* Phase label */}
      <p style={{ ...styles.phaseLabel, color: PHASE_COLORS[phase] }}>
        {phaseLabel}
      </p>

      {/* Circular timer display */}
      <div
        style={{
          ...styles.timerCircle,
          background: `conic-gradient(${PHASE_COLORS[phase]} ${progressDeg}deg, rgba(60,67,107,0.4) ${progressDeg}deg)`,
        }}
      >
        <div style={styles.timerInner}>
          <span style={styles.timeDisplay}>{formattedTime}</span>
        </div>
      </div>

      {/* Control buttons */}
      <div style={styles.btnRow}>
        {!isRunning ? (
          <button id="timer-start" onClick={start} style={{ ...styles.btn, background: PHASE_COLORS[phase] }}>
            {sessionStartTime ? "Resume" : "Start Focus"}
          </button>
        ) : (
          <button id="timer-pause" onClick={pause} style={{ ...styles.btn, background: "var(--c-surface)", border: "1px solid var(--c-accent)" }}>
            Pause
          </button>
        )}
        <button id="timer-reset" onClick={reset} style={styles.ghostBtn}>
          Reset
        </button>
        {sessionStartTime && (
          <button id="timer-end" onClick={handleEnd} style={{ ...styles.ghostBtn, color: "#c87e7e", borderColor: "rgba(200,126,126,0.4)" }}>
            End Session
          </button>
        )}
      </div>

      {/* Session stats */}
      {completedFocusCount > 0 && (
        <div style={styles.stats}>
          <span>✅ {completedFocusCount} block{completedFocusCount !== 1 ? "s" : ""} done</span>
          <span>⏱ {elapsedFocusMinutes} min focused</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: "24px",
    background: "var(--c-surface)",
    borderRadius: 16,
    border: "1px solid rgba(143,139,182,0.2)",
  },
  phaseLabel: {
    margin: 0,
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  timerInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "var(--c-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: 800,
    color: "var(--c-text)",
    letterSpacing: 1,
    fontVariantNumeric: "tabular-nums",
  },
  btnRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btn: {
    padding: "9px 22px",
    borderRadius: 10,
    border: "none",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  ghostBtn: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "1px solid rgba(143,139,182,0.35)",
    background: "transparent",
    color: "var(--c-accent)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  stats: {
    display: "flex",
    gap: 16,
    fontSize: 13,
    color: "var(--c-accent)",
  },
};
