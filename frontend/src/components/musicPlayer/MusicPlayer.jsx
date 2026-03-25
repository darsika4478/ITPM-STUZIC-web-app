// MusicPlayer.jsx – root orchestrator for the music player & session tracker
import { useState, useCallback } from "react";
import { usePlayerState } from "../../hooks/usePlayerState";
import { getPlaylistByMood } from "../../data/dummyTracks";
import MusicPanel from "./MusicPanel";
import SessionHistory from "./SessionHistory";

export default function MusicPlayer({ mood = "focus" }) {
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

  // Saved sessions (will be replaced by Firestore fetch when ready)
  const [sessions, setSessions] = useState([]);

  // Called when user clicks "End Session" in SessionTimer
  const handleSessionEnd = useCallback(
    ({ sessionStartTime, elapsedFocusMinutes, completedFocusCount }) => {
      if (!sessionStartTime) return;
      const newSession = {
        id: `local-${Date.now()}`,
        mood,
        trackTitle: currentTrack?.title || "Unknown",
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        durationMinutes: elapsedFocusMinutes || Math.round(completedFocusCount * 25),
      };
      setSessions((prev) => [newSession, ...prev]);

      // TODO: replace with Firestore call once firebaseConfig is set up
      // import { startSession, endSession } from "../../firebase/sessionService";
    },
    [mood, currentTrack]
  );

  return (
    <div style={styles.page}>
      {/* Page title */}
      <div style={styles.titleRow}>
        <h1 style={styles.pageTitle}>
          <span style={{ color: "var(--c-accent)" }}>♪</span> Music Player
        </h1>
        <span style={styles.moodPill}>
          Mood: <strong style={{ color: "var(--c-text)" }}>{mood}</strong>
        </span>
      </div>

      <div style={styles.layout}>
        {/* Left column: player panel */}
        <div style={styles.leftCol}>
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

        {/* Right column: playlist + session history */}
        <div style={styles.rightCol}>
          {/* Playlist */}
          <div style={styles.playlistCard}>
            <h3 style={styles.sectionHeading}>Playlist</h3>
            <div style={styles.trackList}>
              {playlist.map((track, idx) => (
                <button
                  key={track.id}
                  id={`track-${track.id}`}
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
                  <span style={styles.trackNum}>{idx + 1}</span>
                  <div style={styles.trackInfo}>
                    <span style={styles.trackTitle}>{track.title}</span>
                    <span style={styles.trackArtist}>{track.artist}</span>
                  </div>
                  {idx === currentIndex && isPlaying && (
                    <span style={styles.playingDot}>▶</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Session history */}
          <SessionHistory sessions={sessions} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  pageTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "var(--c-text)",
    letterSpacing: 0.3,
  },
  moodPill: {
    fontSize: 13,
    color: "var(--c-accent)",
    background: "rgba(143,139,182,0.12)",
    padding: "5px 14px",
    borderRadius: 20,
    textTransform: "capitalize",
  },
  layout: {
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  leftCol: {
    flex: "0 0 auto",
    width: "100%",
    maxWidth: 440,
  },
  rightCol: {
    flex: 1,
    minWidth: 280,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  playlistCard: {
    background: "var(--c-surface)",
    borderRadius: 16,
    border: "1px solid rgba(143,139,182,0.2)",
    overflow: "hidden",
  },
  sectionHeading: {
    margin: 0,
    padding: "14px 20px",
    fontSize: 15,
    fontWeight: 700,
    color: "var(--c-text)",
    borderBottom: "1px solid rgba(143,139,182,0.12)",
  },
  trackList: {
    display: "flex",
    flexDirection: "column",
  },
  trackItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "background 0.15s",
    color: "var(--c-text)",
    borderBottom: "1px solid rgba(143,139,182,0.06)",
  },
  trackNum: {
    fontSize: 12,
    color: "rgba(182,180,187,0.4)",
    width: 18,
    textAlign: "right",
    flexShrink: 0,
  },
  trackInfo: {
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
  playingDot: {
    fontSize: 11,
    color: "var(--c-primary)",
  },
};
