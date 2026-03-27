import { useNavigate } from 'react-router-dom';
import PlayerPage from './PlayerPage';
import PlaylistPage from './PlaylistPage';
import HistoryPage from './HistoryPage';
import { useMusicPlayer } from '../context/useMusicPlayer';
import { useState } from 'react';

const MusicPlayerFullScreen = () => {
  const navigate = useNavigate();
  const { mood, changeMood } = useMusicPlayer();
  const [activeTab, setActiveTab] = useState('playlist');

  const handleBack = () => {
    navigate('/dashboard/mood-recommendation');
  };

  return (
    <div className="w-full flex flex-col min-h-screen relative" style={{ background: 'linear-gradient(135deg, #1c1848 0%, #100d2b 100%)' }}>
      {/* Header / Back Button */}
      <div className="p-4 border-b border-purple-400/10 backdrop-blur-md sticky top-0 z-10 w-full bg-[#1c1848]/80">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-purple-900/40 text-purple-100 transition-all border border-purple-400/20 active:scale-95 shadow-lg group"
          style={{ background: 'rgba(109,95,231,0.15)' }}
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Music Recommendation
        </button>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 flex flex-col gap-10 px-8 py-8 md:px-4 sm:px-3 overflow-y-auto pb-32">
        
        {/* Top Section: Main Player (ALWAYS VISIBLE) */}
        <div className="w-full max-w-5xl mx-auto backdrop-blur-lg bg-white/5 rounded-3xl p-8 md:p-4 border border-white/10 shadow-2xl">
          <PlayerPage onMoodChange={changeMood} />
        </div>

        {/* Separator / Decoration */}
        <div className="flex items-center gap-4 w-full max-w-6xl mx-auto opacity-30">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-400"></div>
          <div className="text-purple-300 text-sm font-semibold tracking-widest uppercase">Content Library</div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-400"></div>
        </div>

        {/* Bottom Section: Playlist & History Tabs (TABLE BELOW PLAYER) */}
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 bg-black/20 rounded-3xl p-6 border border-purple-400/15 min-h-[500px] shadow-inner mb-10">
          
          {/* Enhanced Tab Navigation */}
          <div className="flex gap-4 p-1.5 bg-purple-950/40 rounded-2xl border border-purple-400/10 w-fit">
            <button
              onClick={() => setActiveTab('playlist')}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'playlist' 
                ? 'bg-purple-600 text-white shadow-[0_4px_15px_rgba(147,51,234,0.4)] scale-105' 
                : 'text-purple-300/60 hover:text-purple-200 hover:bg-white/5'
              }`}
            >
              <span className="text-lg">📋</span> Playlist Table
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'history' 
                ? 'bg-purple-600 text-white shadow-[0_4px_15px_rgba(147,51,234,0.4)] scale-105' 
                : 'text-purple-300/60 hover:text-purple-200 hover:bg-white/5'
              }`}
            >
              <span className="text-lg">📊</span> History Log
            </button>
          </div>

          {/* Tab Content Display Area */}
          <div className="flex-1 w-full animate-fadeIn overflow-hidden">
            {activeTab === 'playlist' ? (
              <div className="h-full">
                <PlaylistPage currentMood={mood} onMoodChange={changeMood} />
              </div>
            ) : (
              <div className="h-full">
                <HistoryPage />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Bottom Music Bar (moving to global layout) */}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.2);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.4);
        }
      `}</style>
    </div>
  );
};

export default MusicPlayerFullScreen;

