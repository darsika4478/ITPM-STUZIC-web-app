import React from 'react';
import BaseLayout from '../../layout/BaseLayout';
import HistoryCard from '../../components/MusicSessionModule/HistoryCard';

export default function MusicHistoryPage() {
  const dummyTracks = [
    { title: "Lofi Study Beats", plays: 15 },
    { title: "Deep Focus Ambient", plays: 12 },
    { title: "Piano Tiles", plays: 8 },
  ];

  return (
    <BaseLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-[#B6B4BB]">Music History</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HistoryCard title="Total Plays" value="35" />
          <HistoryCard title="Favorite Playlist" value="Focus Flow" />
        </div>

        <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Most Played Tracks</h2>
          <div className="space-y-4">
            {dummyTracks.map((track, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded-xl">
                <span className="text-[#B6B4BB] font-semibold">{track.title}</span>
                <span className="text-[#8F8BB6]">{track.plays} plays</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
