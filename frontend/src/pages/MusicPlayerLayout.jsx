import { useSearchParams, useNavigate } from 'react-router-dom';
import BaseLayout from '../layout/BaseLayout';
import { MusicPlayerProvider } from '../context/MusicPlayerContext.jsx';
import PlayerPage from './PlayerPage';
import PlaylistPage from './PlaylistPage';
import HistoryPage from './HistoryPage';
import './MusicPlayerLayout.css';

const MusicPlayerLayoutContent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = searchParams.get('page') || 'player';
  const mood = searchParams.get('mood') || 'neutral';

  const handlePageChange = (newPage) => {
    navigate(`/music?page=${newPage}&mood=${mood}`);
  };

  const handleMoodChange = (newMood) => {
    navigate(`/music?page=${page}&mood=${newMood}`);
  };

  return (
    <BaseLayout>
      <div className="music-player-layout">
        {/* Main Content Grid */}
        <div className="music-grid-container">
          {/* Primary Player Section - 70% width on desktop */}
          <div className="player-section">
            {page === 'player' && <PlayerPage onMoodChange={handleMoodChange} />}
          </div>

          {/* Secondary Sections - 30% width on desktop, becomes tabs on mobile */}
          <div className="secondary-sections">
            {/* Tab Navigation */}
            <div className="secondary-tabs">
              <button
                className={`secondary-tab ${page === 'playlist' ? 'active' : ''}`}
                onClick={() => handlePageChange('playlist')}
              >
                📋 Playlist
              </button>
              <button
                className={`secondary-tab ${page === 'history' ? 'active' : ''}`}
                onClick={() => handlePageChange('history')}
              >
                📊 History
              </button>
            </div>

            {/* Tab Content */}
            <div className="secondary-content">
              {page === 'playlist' && <PlaylistPage currentMood={mood} onMoodChange={handleMoodChange} />}
              {page === 'history' && <HistoryPage />}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

const MusicPlayerLayout = () => {
  const [searchParams] = useSearchParams();
  const initialMood = searchParams.get('mood') || 'neutral';

  return (
    <MusicPlayerProvider initialMood={initialMood}>
      <MusicPlayerLayoutContent />
    </MusicPlayerProvider>
  );
};

export default MusicPlayerLayout;
