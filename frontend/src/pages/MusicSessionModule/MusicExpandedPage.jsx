import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../layout/BaseLayout';
import MusicPlayer from '../../components/MusicSessionModule/MusicPlayer';

export default function MusicExpandedPage() {
  const navigate = useNavigate();
  
  const dummyPlaylists = ['Focus Flow', 'Deep Work', 'Chill Beats'];
  const dummyTracks = ['Track 1 - Lofi', 'Track 2 - Study', 'Track 3 - Piano'];

  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-[#B6B4BB]">Expanded Music Page</h1>
          <button 
            onClick={() => navigate('/player/music/history')}
            className="px-4 py-2 bg-[#585296] hover:bg-[#8F8BB6] text-white font-bold rounded-xl transition-colors"
          >
            View Music Analytics
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <MusicPlayer />
            <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Track List</h2>
              <div className="space-y-2">
                {dummyTracks.map((track, i) => (
                  <div key={i} className="p-3 bg-black/20 rounded-xl text-[#B6B4BB] hover:bg-black/40 cursor-pointer">
                    {track}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Mood Filter</h2>
              <div className="flex flex-wrap gap-2">
                {['Relax', 'Focus', 'Upbeat'].map((mood, i) => (
                  <span key={i} className="px-3 py-1 bg-[#585296] text-white rounded-full text-sm">{mood}</span>
                ))}
              </div>
            </div>
            <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Playlists</h2>
              <ul className="space-y-3">
                {dummyPlaylists.map((pl, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#B6B4BB] hover:text-white cursor-pointer p-2 rounded-xl hover:bg-black/20 transition-colors">
                    <span className="text-[#8F8BB6]">🎵</span> {pl}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
