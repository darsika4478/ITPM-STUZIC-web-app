// SessionTrackerView.jsx – Dedicated session tracking view extending from MusicPanel
import { useState, useCallback } from "react";
import { usePlayerState } from "../../hooks/usePlayerState";
import { getPlaylistByMood } from "../../data/dummyTracks";
import MusicPanel from "./MusicPanel";
import SessionHistory from "./SessionHistory";

export default function SessionTrackerView({ mood = "focus" }) {
  const playlist = getPlaylistByMood(mood);
  const {
    currentTrack,
    isPlaying,
    isRepeat,
    volume,
    setVolume,
    togglePlay,
    playNext,
    playPrev,
    toggleRepeat,
  } = usePlayerState(playlist);

  // Session state management
  const [sessions, setSessions] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalFocusTime: 0,
    averageSessionLength: 0,
  });

  // Enhanced session end handler with statistics
  const handleSessionEnd = useCallback(
    ({ sessionStartTime, elapsedFocusMinutes, completedFocusCount }) => {
      if (!sessionStartTime) return;

      const newSession = {
        id: `session-${Date.now()}`,
        mood,
        trackTitle: currentTrack?.title || "Unknown Track",
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        durationMinutes: elapsedFocusMinutes || Math.round(completedFocusCount * 25),
        completedPomodoros: completedFocusCount || 0,
      };

      setSessions((prev) => [newSession, ...prev]);

      // Update statistics
      const updatedSessions = [newSession, ...sessions];
      const totalTime = updatedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const avgLength = totalTime / updatedSessions.length;

      setSessionStats({
        totalSessions: updatedSessions.length,
        totalFocusTime: totalTime,
        averageSessionLength: Math.round(avgLength),
      });

      // TODO: Replace with Firestore integration
      console.log("Session saved:", newSession);
    },
    [mood, currentTrack, sessions]
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span style={{ color: "var(--c-accent)" }}>⏱️</span> Session Tracker
        </h2>
        <span style={styles.moodBadge}>
          {mood} sessions
        </span>
      </div>

      <div style={styles.statsOverview}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{sessionStats.totalSessions}</span>
          <span style={styles.statLabel}>Total Sessions</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{sessionStats.totalFocusTime}m</span>
          <span style={styles.statLabel}>Focus Time</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{sessionStats.averageSessionLength}m</span>
          <span style={styles.statLabel}>Avg Session</span>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.playerSection}>
          <h3 style={styles.sectionTitle}>Current Session</h3>
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

        <div style={styles.historySection}>
          <SessionHistory sessions={sessions} />
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
    maxWidth: 1000,
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
  statsOverview: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    background: "var(--c-surface)",
    borderRadius: 12,
    border: "1px solid rgba(143,139,182,0.2)",
    padding: 16,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: "var(--c-primary)",
  },
  statLabel: {
    fontSize: 12,
    color: "var(--c-accent)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--c-text)",
  },
  historySection: {
    flex: 1,
    minWidth: 400,
  },
};