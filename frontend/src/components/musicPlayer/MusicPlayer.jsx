// MusicPlayer.jsx – root orchestrator for the music player & session tracker
import { useState, useCallback } from "react";
import { usePlayerState } from "../../hooks/usePlayerState";
import { getPlaylistByMood } from "../../data/dummyTracks";
import MusicPanel from "./MusicPanel";
import SessionHistory from "./SessionHistory";

const MOODS = [
  { id: "sad", label: "Sad", emoji: "😔" },
  { id: "low", label: "Low", emoji: "😞" },
  { id: "neutral", label: "Neutral", emoji: "😐" },
  { id: "good", label: "Good", emoji: "🙂" },
  { id: "happy", label: "Happy", emoji: "😄" },
];

export default function MusicPlayer({ mood = "neutral", onMoodChange }) {
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
    },
    [mood, currentTrack]
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto py-6 px-4">
      {/* Header Row with Title and Mood Selector */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
        <h1 className="text-3xl font-extrabold text-[#B6B4BB] tracking-wide flex-shrink-0">
          <span className="text-[#8F8BB6] mr-2">♪</span> Music Player
        </h1>
        
        {/* Mood Selection System */}
        <div className="flex gap-2 sm:gap-4 bg-[#3C436B]/60 p-2 sm:p-3 rounded-2xl border border-[#8F8BB6]/15 backdrop-blur-md shadow-inner overflow-x-auto w-full md:w-auto">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => onMoodChange && onMoodChange(m.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-out whitespace-nowrap outline-none ${
                mood === m.id
                  ? "bg-[#585296] text-white shadow-[0_0_20px_rgba(88,82,150,0.6)] scale-105 border border-[#8F8BB6]/30"
                  : "text-[#B6B4BB] hover:bg-[#8F8BB6]/15 hover:text-white border border-transparent"
              }`}
            >
              <span className="text-lg">{m.emoji}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Left column: Player panel (70%) */}
        <div className="w-full lg:w-[70%] flex-shrink-0">
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

        {/* Right column: Playlist + Session History (30%) */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6">
          
          {/* Playlist Card */}
          <div className="bg-[#3C436B] rounded-2xl border border-[#8F8BB6]/20 overflow-hidden shadow-lg transition-all hover:shadow-[0_8px_30px_rgba(60,67,107,0.4)]">
            <h3 className="m-0 py-4 px-5 text-[15px] font-bold text-white border-b border-[#8F8BB6]/15 bg-gradient-to-r from-[#3C436B] to-[#585296]/20">
              Playlist
            </h3>
            <div className="flex flex-col max-h-[400px] overflow-y-auto">
              {playlist.map((track, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(idx)}
                    className={`flex items-center gap-3 p-3.5 w-full text-left transition-colors border-b border-[#8F8BB6]/5 last:border-0 ${
                      isActive 
                        ? "bg-[#585296]/30 border-l-4 border-l-[#8F8BB6]" 
                        : "bg-transparent border-l-4 border-l-transparent hover:bg-[#8F8BB6]/10"
                    }`}
                  >
                    <span className="text-xs text-[#B6B4BB]/60 w-5 text-right flex-shrink-0 font-medium tracking-wider">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <span className={`text-[14px] font-semibold truncate ${isActive ? "text-white" : "text-[#B6B4BB]"}`}>
                        {track.title}
                      </span>
                      <span className="text-xs text-[#8F8BB6] truncate">
                        {track.artist}
                      </span>
                    </div>
                    {isActive && isPlaying && (
                      <span className="text-xs text-[#8F8BB6] animate-pulse">▶</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session History Card */}
          <div className="bg-[#3C436B] rounded-2xl border border-[#8F8BB6]/20 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(60,67,107,0.4)] transition-all">
            <SessionHistory sessions={sessions} />
          </div>

        </div>
      </div>
    </div>
  );
}
