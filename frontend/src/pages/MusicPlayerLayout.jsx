import { useState } from 'react';
import { MusicPlayerProvider } from '../context/MusicPlayerContext.jsx';
import PlayerPage from './PlayerPage';
import PlaylistPage from './PlaylistPage';
import HistoryPage from './HistoryPage';

const MusicPlayerLayoutContent = () => {
  const [page, setPage] = useState('player');
  const [mood, setMood] = useState('neutral');

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleMoodChange = (newMood) => {
    setMood(newMood);
  };

  return (
      <div className="flex flex-col gap-6 w-full h-full px-6 md:px-4 sm:px-4 py-6 md:py-4 sm:py-4">
        {/* Main Content Grid */}
        <div className="grid grid-cols-[1fr_0.5fr] md:grid-cols-1 gap-6 md:gap-4 flex-1 w-full">
          {/* Primary Player Section - 70% width on desktop */}
          <div className="flex flex-col gap-6 md:gap-4 min-h-[600px] md:min-h-[500px] sm:min-h-[400px]">
            {page === 'player' && <PlayerPage onMoodChange={handleMoodChange} />}
          </div>

          {/* Secondary Sections - 30% width on desktop, becomes tabs on mobile */}
          <div className="flex flex-col gap-4 bg-purple-950/40 backdrop-blur-md border border-purple-400/15 rounded-2xl px-4 py-4 border border-purple-400/15 overflow-hidden md:min-h-[300px] sm:min-h-auto sm:max-h-[400px]">
            {/* Tab Navigation */}
            <div className="flex gap-2 sm:gap-1 border-b border-purple-400/10 pb-3 sm:pb-2">
              <button
                className={`px-4 sm:px-3 py-2.5 sm:py-2 border-none text-purple-100 cursor-pointer text-xs font-semibold rounded-lg transition-all duration-200 relative hover:bg-purple-900/20 hover:text-purple-400 ${
                  page === 'playlist' ? 'bg-purple-900 text-white shadow-lg' : 'bg-transparent'
                }`}
                onClick={() => handlePageChange('playlist')}
              >
                📋 Playlist
              </button>
              <button
                className={`px-4 sm:px-3 py-2.5 sm:py-2 border-none text-purple-100 cursor-pointer text-xs font-semibold rounded-lg transition-all duration-200 relative hover:bg-purple-900/20 hover:text-purple-400 ${
                  page === 'history' ? 'bg-purple-900 text-white shadow-lg' : 'bg-transparent'
                }`}
                onClick={() => handlePageChange('history')}
              >
                📊 History
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3">
              {page === 'playlist' && <PlaylistPage currentMood={mood} onMoodChange={handleMoodChange} />}
              {page === 'history' && <HistoryPage />}
            </div>
          </div>
        </div>
      </div>
  );
};

const MusicPlayerLayout = () => {
  return (
    <MusicPlayerProvider>
      <MusicPlayerLayoutContent />
    </MusicPlayerProvider>
  );
};

export default MusicPlayerLayout;
