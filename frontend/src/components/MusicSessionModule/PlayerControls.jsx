import React from 'react';

export default function PlayerControls({ isPlaying, togglePlay }) {
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      <button className="text-[#8F8BB6] hover:text-white text-2xl">⏮</button>
      <button 
        onClick={togglePlay}
        className="w-14 h-14 flex items-center justify-center bg-[#585296] text-white rounded-full hover:scale-105 transition-transform text-xl"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button className="text-[#8F8BB6] hover:text-white text-2xl">⏭</button>
    </div>
  );
}
