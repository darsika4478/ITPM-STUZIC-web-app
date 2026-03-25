import { useMusicPlayer } from '../context/useMusicPlayer';
import NowPlayingCard from '../components/musicPlayer/NowPlayingCard';
import PlayerControls from '../components/musicPlayer/PlayerControls';
import SessionTimer from '../components/musicPlayer/SessionTimer';
import './PlayerPage.css';

const PlayerPage = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    volume,
    setVolume,
    isRepeat,
    toggleRepeat,
  } = useMusicPlayer();

  return (
    <div className="player-page">
      <div className="player-container">
        {/* Now Playing Section */}
        <div className="now-playing-section">
          <h2>Now Playing</h2>
          {currentTrack && (
            <NowPlayingCard
              track={currentTrack}
              isPlaying={isPlaying}
            />
          )}
        </div>

        {/* Player Controls Section */}
        <div className="player-controls-section">
          <PlayerControls
            isPlaying={isPlaying}
            onPlayToggle={togglePlay}
            onNext={playNext}
            onPrev={playPrev}
            volume={volume}
            onVolumeChange={setVolume}
            isRepeat={isRepeat}
            onRepeatToggle={toggleRepeat}
          />
        </div>

        {/* Session Timer Section */}
        <div className="session-timer-section">
          <SessionTimer onSessionEnd={(sessionData) => {
            console.log('Session ended:', sessionData);
          }} />
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
