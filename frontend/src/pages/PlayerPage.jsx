import { useMusicPlayer } from '../context/useMusicPlayer';
import NowPlayingCard from '../components/musicPlayer/NowPlayingCard';
import PlayerControls from '../components/musicPlayer/PlayerControls';

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
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[600px] py-10 px-6 animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#1c1848]/40 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row items-center">
        
        {/* Left Side: Elaborate Artwork Section */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600/10 to-transparent">
          <h2 className="text-xs font-bold text-purple-300/40 uppercase tracking-[0.2em] mb-8">Now Playing</h2>
          {currentTrack && (
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-3xl opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700"></div>
              <div className="relative">
                <NowPlayingCard
                  track={currentTrack}
                  isPlaying={isPlaying}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Controls & Info */}
        <div className="w-full md:w-1/2 p-10 md:p-12 flex flex-col gap-10 bg-white/[0.02]">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-[10px] font-bold text-green-400/80 uppercase tracking-widest">Live System</span>
             </div>
             <h3 className="text-3xl font-black text-white leading-tight">Interactive Player</h3>
             <p className="text-purple-200/40 text-sm">Control your focus environment with precision.</p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.05] transition-colors shadow-inner">
            <PlayerControls
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onNext={playNext}
              onPrev={playPrev}
              volume={volume}
              onVolumeChange={setVolume}
              isRepeat={isRepeat}
              onToggleRepeat={toggleRepeat}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-purple-300/30 uppercase tracking-[0.15em] px-2">
              <span>Studio Quality</span>
              <span>24-bit Lossless</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
