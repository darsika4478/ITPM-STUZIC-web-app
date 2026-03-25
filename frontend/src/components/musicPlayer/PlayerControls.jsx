// PlayerControls.jsx – play/pause, next, prev, volume slider, repeat toggle

export default function PlayerControls({
  isPlaying,
  isRepeat,
  volume,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleRepeat,
  onVolumeChange,
}) {
  return (
    <div style={styles.wrapper}>
      {/* Main controls row */}
      <div style={styles.controlsRow}>
        {/* Repeat */}
        <button
          id="btn-repeat"
          onClick={onToggleRepeat}
          title="Toggle Repeat"
          style={{ ...styles.iconBtn, color: isRepeat ? "var(--c-primary)" : "var(--c-accent)" }}
        >
          ⟳
        </button>

        {/* Previous */}
        <button
          id="btn-prev"
          onClick={onPrev}
          title="Previous Track"
          style={styles.iconBtn}
        >
          ⏮
        </button>

        {/* Play / Pause */}
        <button
          id="btn-play-pause"
          onClick={onTogglePlay}
          title={isPlaying ? "Pause" : "Play"}
          style={styles.playBtn}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* Next */}
        <button
          id="btn-next"
          onClick={onNext}
          title="Next Track"
          style={styles.iconBtn}
        >
          ⏭
        </button>

        {/* Volume icon (non-interactive, decorative) */}
        <span style={{ ...styles.iconBtn, cursor: "default", color: "var(--c-accent)" }}>
          🔊
        </span>
      </div>

      {/* Volume slider */}
      <div style={styles.volumeRow}>
        <span style={styles.volumeLabel}>Vol</span>
        <input
          id="volume-slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          style={styles.slider}
          aria-label="Volume"
        />
        <span style={styles.volumeLabel}>{Math.round(volume * 100)}%</span>
      </div>

      <style>{`
        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            var(--c-primary) 0%,
            var(--c-primary) calc(${Math.round(volume * 100)}%),
            rgba(143,139,182,0.25) calc(${Math.round(volume * 100)}%),
            rgba(143,139,182,0.25) 100%
          );
          outline: none;
          cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: var(--c-accent);
          cursor: pointer;
          transition: transform 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.3); }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    padding: "20px 24px",
    background: "var(--c-surface)",
    borderRadius: 16,
    border: "1px solid rgba(143,139,182,0.2)",
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: "var(--c-accent)",
    fontSize: 22,
    cursor: "pointer",
    padding: 8,
    borderRadius: 10,
    transition: "background 0.15s, transform 0.1s",
    lineHeight: 1,
  },
  playBtn: {
    background: "var(--c-primary)",
    border: "none",
    color: "#fff",
    fontSize: 22,
    cursor: "pointer",
    width: 54,
    height: 54,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(88,82,150,0.5)",
    transition: "transform 0.1s, box-shadow 0.15s",
  },
  volumeRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    maxWidth: 300,
  },
  slider: {
    flex: 1,
  },
  volumeLabel: {
    fontSize: 12,
    color: "rgba(182,180,187,0.6)",
    minWidth: 28,
    textAlign: "center",
  },
};
