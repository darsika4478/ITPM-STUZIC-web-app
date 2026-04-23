// MusicPanel.jsx – styled wrapper that groups NowPlayingCard + PlayerControls + SessionTimer + SongsPlayedSection
import { useState } from "react";
import EnhancedNowPlayingCard from "./EnhancedNowPlayingCard";
import PlayerControls from "./PlayerControls";
import SessionTimer from "./SessionTimer";
import SongsPlayedSection from "./SongsPlayedSection";

export default function MusicPanel({
  currentTrack,
  mood,
  isPlaying,
  isRepeat,
  volume,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleRepeat,
  onVolumeChange,
  onSessionEnd,
}) {
  const [sessionActive, setSessionActive] = useState(false);
  const [playedSongs, setPlayedSongs] = useState([]);

  const handleSessionStart = () => {
    setSessionActive(true);
  };

  const handleSessionReset = () => {
    setSessionActive(false);
    setPlayedSongs([]);
  };

  const handleSongsPlayedUpdate = (songs) => {
    setPlayedSongs(songs);
  };

  const handleSessionEnd = (sessionData) => {
    setSessionActive(false);
    setPlayedSongs([]);
    
    if (onSessionEnd) {
      onSessionEnd(sessionData);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Now Playing Area with enhanced styling */}
      <div className="flex-1 flex items-center justify-center min-h-95 px-4 py-8">
        <EnhancedNowPlayingCard 
          track={currentTrack} 
          mood={mood} 
          isPlaying={isPlaying}
          isSessionActive={sessionActive}
        />
      </div>

      {/* Controls */}
      <div className="w-full max-w-3xl mx-auto backdrop-blur-md bg-[#3C436B]/40 rounded-3xl p-6 shadow-xl border border-[#8F8BB6]/20 transition-all duration-300">
        <PlayerControls
          isPlaying={isPlaying}
          isRepeat={isRepeat}
          volume={volume}
          onTogglePlay={onTogglePlay}
          onNext={onNext}
          onPrev={onPrev}
          onToggleRepeat={onToggleRepeat}
          onVolumeChange={onVolumeChange}
        />
      </div>

      {/* Focus Timer */}
      <div className="w-full max-w-xl mx-auto">
        <SessionTimer 
          onSessionEnd={handleSessionEnd}
          onSessionStart={handleSessionStart}
          onSessionReset={handleSessionReset}
          onSongsPlayed={handleSongsPlayedUpdate}
        />
      </div>

      {/* Songs Played Section - positioned below timer */}
      <div className="w-full max-w-xl mx-auto">
        <SongsPlayedSection 
          playedSongs={playedSongs}
          isSessionActive={sessionActive}
        />
      </div>
    </div>
  );
}
