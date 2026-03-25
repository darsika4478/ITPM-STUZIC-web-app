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
    <div style={styles.panel}>
      {/* Now Playing */}
      <NowPlayingCard track={currentTrack} mood={mood} isPlaying={isPlaying} />

      {/* Controls */}
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

      {/* Focus Timer */}
      <SessionTimer onSessionEnd={onSessionEnd} />
    </div>
  );
}

const styles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    maxWidth: 440,
  },
};
