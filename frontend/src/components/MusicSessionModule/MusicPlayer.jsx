import React, { useState } from 'react';
import PlayerControls from './PlayerControls';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-2">Now Playing</h2>
      <p className="text-[#8F8BB6] mb-4">Lofi Study Beats - Chillhop</p>
      <div className="w-full bg-black/20 rounded-full h-2 mb-4">
        <div className="bg-[#585296] h-2 rounded-full w-1/3"></div>
      </div>
      <PlayerControls isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)} />
    </div>
  );
}
