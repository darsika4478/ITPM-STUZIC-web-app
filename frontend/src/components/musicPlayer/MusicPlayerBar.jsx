import React from 'react';
import { useMusicPlayer } from '../../context/useMusicPlayer';

export default function MusicPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    volume,
    setVolume,
    isPlayerActive,
    currentTime,
    duration,
    seekTo,
  } = useMusicPlayer();

  if (!currentTrack || !isPlayerActive) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seekTo(percentage * duration);
  };

  return (
    <div className="music-player-bar fixed bottom-0 md:bottom-0 left-0 md:left-64 right-0 z-[100] bg-[#1A1D2E]/95 backdrop-blur-xl border-t border-purple-400/20 px-3 sm:px-4 md:px-8 py-2 sm:py-3 md:py-4 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.6)] animate-slideUp">
      {/* Track Info */}
      <div className="flex items-center gap-3 md:gap-5 w-auto md:w-1/3 min-w-0 flex-1 md:flex-initial pr-2">
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10 relative overflow-hidden group">
          <span className="text-white text-xl md:text-2xl group-hover:scale-110 transition-transform">♪</span>
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-white font-bold text-sm md:text-base truncate leading-tight">{currentTrack.title}</h4>
          <p className="text-purple-300/70 text-xs md:text-sm truncate">{currentTrack.artist || 'Unknown Artist'}</p>
        </div>
      </div>

      {/* Main Controls - Center */}
      <div className="flex flex-col items-center gap-2 md:gap-3 w-auto md:w-1/3 shrink-0">
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={playPrev} 
            className="text-purple-200/60 hover:text-white transition-all hover:scale-110 active:scale-95 text-xl md:text-2xl hidden sm:block"
            title="Previous"
          >
            ⏮
          </button>
          <button 
            onClick={togglePlay} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-purple-900 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            title={isPlaying ? "Pause" : "Play"}
          >
            <span className="text-lg md:text-xl">{isPlaying ? "⏸" : "▶"}</span>
          </button>
          <button 
            onClick={playNext} 
            className="text-purple-200/60 hover:text-white transition-all hover:scale-110 active:scale-95 text-xl md:text-2xl"
            title="Next"
          >
            ⏭
          </button>
        </div>
        
        {/* Progress Bar (Hidden on very small mobile) */}
        <div className="hidden sm:flex w-full max-w-md items-center gap-3">
          <span className="text-[10px] text-purple-300/50 font-medium font-mono">{formatTime(currentTime)}</span>
          <div 
            onClick={handleSeek}
            className="flex-1 h-1.5 bg-purple-900/40 rounded-full overflow-hidden relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] relative"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>
          <span className="text-[10px] text-purple-300/50 font-medium font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extras - Volume & Options */}
      <div className="hidden md:flex items-center justify-end gap-6 w-1/3">
        <div className="flex items-center gap-3 group">
          <span className="text-purple-300/60 group-hover:text-purple-300 transition-colors">
            {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 rounded-full appearance-none bg-purple-900/60 cursor-pointer accent-white hover:accent-purple-300 transition-all"
          />
        </div>
        <button className="text-purple-300/40 hover:text-white transition-colors text-xl">
           ⚙️
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
