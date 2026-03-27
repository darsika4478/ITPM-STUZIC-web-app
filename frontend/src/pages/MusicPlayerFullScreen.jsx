import { useNavigate } from 'react-router-dom';
import PlayerPage from './PlayerPage';
import PlaylistPage from './PlaylistPage';
import HistoryPage from './HistoryPage';
import { useState } from 'react';

const MusicPlayerFullScreen = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState('player');
  const [mood, setMood] = useState('neutral');

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleMoodChange = (newMood) => {
    setMood(newMood);
  };

  const handleBack = () => {
    navigate('/dashboard/mood-recommendation');
  };

  return (
      <div className="w-full flex flex-col gap-4" style={{ background: '#1c1848' }}>
          {/* Back Button */}
          <div className="p-4 border-b border-purple-400/15">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-900/60 text-purple-100 transition-colors"
              style={{ background: 'rgba(109,95,231,0.1)' }}
            >
              ← Back to Music Recommendation
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-6 w-full px-6 md:px-4 sm:px-4 py-6 md:py-4 sm:py-4 overflow-auto">
            {/* Main Content Grid */}
            <div className="grid grid-cols-[1fr_0.5fr] md:grid-cols-1 gap-6 md:gap-4 flex-1 w-full">
              {/* Primary Player Section - 70% width on desktop */}
              <div className="flex flex-col gap-6 md:gap-4 min-h-[600px] md:min-h-[500px] sm:min-h-[400px]">
                {page === 'player' && <PlayerPage onMoodChange={handleMoodChange} />}
                {page === 'playlist' && <PlaylistPage />}
                {page === 'history' && <HistoryPage />}
              </div>

              {/* Secondary Sections - 30% width on desktop, becomes tabs on mobile */}
              <div className="flex flex-col gap-4 backdrop-blur-md border border-purple-400/15 rounded-2xl px-4 py-4 overflow-hidden md:min-h-[300px] sm:min-h-auto sm:max-h-[400px]" style={{ background: 'rgba(60,67,107,0.2)' }}>
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

                {/* Tab Content for Smaller Screens */}
                <div className="overflow-y-auto">
                  {page === 'playlist' && <PlaylistPage />}
                  {page === 'history' && <HistoryPage />}
                </div>
              </div>
            </div>
          </div>
        </div>
  );
};

export default MusicPlayerFullScreen;
