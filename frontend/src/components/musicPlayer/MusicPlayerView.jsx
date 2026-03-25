// MusicPlayerView.jsx – Dedicated music player view extending from MusicPanel
import { useCallback } from "react";
import { usePlayerState } from "../../hooks/usePlayerState";
import { getPlaylistByMood } from "../../data/dummyTracks";
import MusicPanel from "./MusicPanel";

export default function MusicPlayerView({ mood = "focus" }) {
  const playlist = getPlaylistByMood(mood);
  const {
    currentTrack,
    currentIndex,
    isPlaying,
    volume,
    isRepeat,
    setVolume,
    togglePlay,
    playNext,
    playPrev,
    toggleRepeat,
    selectTrack,
  } = usePlayerState(playlist);

  // Session handling (simplified for music player focus)
  const handleSessionEnd = useCallback(() => {
    // Basic session end handling - could be extended
    console.log("Session ended in music player view");
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span style={{ color: "var(--c-accent)" }}>♪</span> Music Player
        </h2>
        <span style={styles.moodBadge}>
          {mood} mode
        </span>
      </div>

      <div style={styles.content}>
        <div style={styles.playerSection}>
          <MusicPanel
            currentTrack={currentTrack}
            mood={mood}
            isPlaying={isPlaying}
            isRepeat={isRepeat}
            volume={volume}
            onTogglePlay={togglePlay}
            onNext={playNext}
            onPrev={playPrev}
            onToggleRepeat={toggleRepeat}
            onVolumeChange={setVolume}
            onSessionEnd={handleSessionEnd}
          />
        </div>

        <div style={styles.playlistSection}>
          <h3 style={styles.sectionTitle}>Current Playlist</h3>
          <div style={styles.trackList}>
            {playlist.map((track, idx) => (
              <button
                key={track.id}
                onClick={() => selectTrack(idx)}
                style={{
                  ...styles.trackItem,
                  background: idx === currentIndex
                    ? "rgba(88,82,150,0.25)"
                    : "transparent",
                  borderLeft: idx === currentIndex
                    ? "3px solid var(--c-primary)"
                    : "3px solid transparent",
                }}
              >
                <span style={styles.trackNumber}>{idx + 1}</span>
                <div style={styles.trackDetails}>
                  <span style={styles.trackTitle}>{track.title}</span>
                  <span style={styles.trackArtist}>{track.artist}</span>
                </div>
                {idx === currentIndex && isPlaying && (
                  <span style={styles.nowPlaying}>▶</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    padding: 20,
    maxWidth: 800,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "var(--c-text)",
    letterSpacing: 0.3,
  },
  moodBadge: {
    fontSize: 14,
    color: "var(--c-accent)",
    background: "rgba(143,139,182,0.12)",
    padding: "6px 16px",
    borderRadius: 20,
    textTransform: "capitalize",
    fontWeight: 600,
  },
  content: {
    display: "flex",
    gap: 32,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  playerSection: {
    flex: "0 0 auto",
    minWidth: 300,
  },
  playlistSection: {
    flex: 1,
    minWidth: 280,
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--c-text)",
  },
  trackList: {
    display: "flex",
    flexDirection: "column",
    background: "var(--c-surface)",
    borderRadius: 12,
    border: "1px solid rgba(143,139,182,0.2)",
    overflow: "hidden",
  },
  trackItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "background 0.15s",
    color: "var(--c-text)",
    borderBottom: "1px solid rgba(143,139,182,0.06)",
  },
  trackNumber: {
    fontSize: 12,
    color: "rgba(182,180,187,0.4)",
    width: 20,
    textAlign: "right",
    flexShrink: 0,
  },
  trackDetails: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--c-text)",
  },
  trackArtist: {
    fontSize: 12,
    color: "var(--c-accent)",
  },
  nowPlaying: {
    fontSize: 11,
    color: "var(--c-primary)",
    fontWeight: 600,
  },
};