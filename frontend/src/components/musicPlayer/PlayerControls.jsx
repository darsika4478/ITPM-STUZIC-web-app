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
        {/* Repeat */}
        <button
          onClick={onToggleRepeat}
          title="Toggle Repeat"
          className={`flex items-center justify-center p-3 sm:p-4 rounded-2xl text-[28px] transition-all duration-300 ${
            isRepeat 
              ? "bg-[#585296]/40 text-[#8F8BB6] shadow-[0_4px_20px_rgba(88,82,150,0.3)] border border-[#8F8BB6]/40 scale-105" 
              : "bg-[#3C436B] text-[#B6B4BB]/70 hover:bg-[#8F8BB6]/20 hover:text-[#B6B4BB] border border-[#8F8BB6]/10"
          }`}
        >
          ⟳
        </button>

        {/* Previous */}
        <button
          onClick={onPrev}
          title="Previous Track"
          className="flex items-center justify-center p-3 sm:p-4 bg-[#3C436B] border border-[#8F8BB6]/10 text-[#B6B4BB]/90 text-[28px] rounded-2xl transition-all duration-300 hover:bg-[#8F8BB6]/20 hover:scale-105 hover:text-white"
        >
          ⏮
        </button>

        {/* Play / Pause - Primary large button */}
        <button
          onClick={onTogglePlay}
          title={isPlaying ? "Pause" : "Play"}
          className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-[32px] bg-gradient-to-br from-[#585296] to-[#8F8BB6] text-white text-[36px] sm:text-[42px] transition-all duration-300 shadow-[0_12px_30px_rgba(88,82,150,0.5),_0_0_20px_rgba(143,139,182,0.3)] hover:scale-110 hover:shadow-[0_15px_40px_rgba(88,82,150,0.6),_0_0_30px_rgba(143,139,182,0.5)] active:scale-95 border-b-4 border-[#3C436B]/30"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          title="Next Track"
          className="flex items-center justify-center p-3 sm:p-4 bg-[#3C436B] border border-[#8F8BB6]/10 text-[#B6B4BB]/90 text-[28px] rounded-2xl transition-all duration-300 hover:bg-[#8F8BB6]/20 hover:scale-105 hover:text-white"
        >
          ⏭
        </button>

        {/* Volume icon placeholder (inactive) */}
        <span className="flex items-center justify-center p-3 sm:p-4 bg-transparent border border-transparent text-[#8F8BB6] text-[28px] rounded-2xl cursor-default opacity-80">
          🔊
        </span>
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-4 w-full max-w-sm mt-2">
        <span className="text-xl text-[#B6B4BB]/70">🔇</span>
        <input
          id="custom-volume-slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer outline-none shadow-sm transition-all"
          style={{
            background: `linear-gradient(to right, #8F8BB6 0%, #8F8BB6 ${Math.round(volume * 100)}%, rgba(143,139,182,0.2) ${Math.round(volume * 100)}%, rgba(143,139,182,0.2) 100%)`
          }}
          aria-label="Volume"
        />
        <span className="text-xl text-[#B6B4BB]/70">🔊</span>
      </div>

      <style>{`
        #custom-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8F8BB6;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(143, 139, 182, 0.4);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 3px solid #272D3E;
        }
        #custom-volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          background: #B6B4BB;
          box-shadow: 0 6px 16px rgba(143, 139, 182, 0.6);
        }
        #custom-volume-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8F8BB6;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(143, 139, 182, 0.4);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 3px solid #272D3E;
        }
        #custom-volume-slider::-moz-range-thumb:hover {
          transform: scale(1.3);
          background: #B6B4BB;
          box-shadow: 0 6px 16px rgba(143, 139, 182, 0.6);
        }
      `}</style>
    </div>
  );
}
