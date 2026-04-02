// MusicPanel.jsx – styled wrapper that groups NowPlayingCard + PlayerControls + SessionTimer
import NowPlayingCard from "./NowPlayingCard";
import PlayerControls from "./PlayerControls";
import SessionTimer from "./SessionTimer";

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
  return (
    <div className="flex flex-col gap-8 w-full h-full justify-center">
      {/* Now Playing Area */}
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
         <NowPlayingCard track={currentTrack} mood={mood} isPlaying={isPlaying} />
      </div>

      {/* Controls */}
      <div className="w-full max-w-3xl mx-auto backdrop-blur-md bg-[#3C436B]/40 rounded-3xl p-6 shadow-xl border border-[#8F8BB6]/20">
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
        <SessionTimer onSessionEnd={onSessionEnd} />
      </div>
    </div>
  );
}
