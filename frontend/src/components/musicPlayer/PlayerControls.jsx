// PlayerControls.jsx – play/pause, next, prev, volume slider, repeat toggle with enhanced styling

export default function PlayerControls({
  isPlaying,
  isRepeat,
  volume,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleRepeat,
  onVolumeChange,
}) {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Main controls row */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">

        {/* Previous */}
        <button
          onClick={onPrev}
          title="Previous Track"
          className="flex items-center justify-center p-4 bg-white/5 border border-white/10 text-white rounded-2xl transition-all duration-300 hover:bg-white/10 hover:scale-110 active:scale-95 group"
        >
          <div className="flex items-center">
            <div className="w-1.5 h-4 bg-current rounded-full"></div>
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-white border-b-[8px] border-b-transparent"></div>
          </div>
        </button>

        {/* Play / Pause - Primary large button */}
        <button
          onClick={onTogglePlay}
          title={isPlaying ? "Pause" : "Play"}
          className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#6d5fe7] to-[#9b7ef8] text-white transition-all duration-300 shadow-[0_15px_35px_rgba(109,95,231,0.4)] hover:scale-110 active:scale-90 border-4 border-white/10 group"
        >
          <div className={`transition-all duration-300 ${isPlaying ? 'scale-100' : 'translate-x-1 scale-110'}`}>
            {isPlaying ? (
              <div className="flex gap-1.5">
                <div className="w-2.5 h-8 bg-white rounded-full"></div>
                <div className="w-2.5 h-8 bg-white rounded-full"></div>
              </div>
            ) : (
              <div className="w-0 h-0 border-t-[16px] border-t-transparent border-l-[28px] border-l-white border-b-[16px] border-b-transparent"></div>
            )}
          </div>
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          title="Next Track"
          className="flex items-center justify-center p-4 bg-white/5 border border-white/10 text-white rounded-2xl transition-all duration-300 hover:bg-white/10 hover:scale-110 active:scale-95 group"
        >
          <div className="flex items-center">
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent"></div>
            <div className="w-1.5 h-4 bg-current rounded-full"></div>
          </div>
        </button>
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-5 w-full max-w-sm mt-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
        <span className="text-sm opacity-40">🔇</span>
        <input
          id="custom-volume-slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer outline-none bg-white/10 overflow-hidden"
          style={{
            background: `linear-gradient(to right, #6d5fe7 0%, #6d5fe7 ${Math.round(volume * 100)}%, rgba(255,255,255,0.1) ${Math.round(volume * 100)}%)`
          }}
          aria-label="Volume"
        />
        <span className="text-sm opacity-40">🔊</span>
      </div>

      <style>{`
        #custom-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0px;
          height: 0px;
        }
        #custom-volume-slider::-moz-range-thumb {
          width: 0px;
          height: 0px;
          border: 0;
        }
      `}</style>
    </div>
  );
}
