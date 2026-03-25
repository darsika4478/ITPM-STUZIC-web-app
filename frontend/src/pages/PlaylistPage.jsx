import { useState } from 'react';
import { useMusicPlayer } from '../context/useMusicPlayer';
import './PlaylistPage.css';

const MOOD_OPTIONS = [
  { value: 'sad', label: 'Sad 😔', emoji: '😔', color: '#585296' },
  { value: 'low', label: 'Low 😞', emoji: '😞', color: '#7B7BA8' },
  { value: 'neutral', label: 'Neutral 😐', emoji: '😐', color: '#8F8BB6' },
  { value: 'good', label: 'Good 🙂', emoji: '🙂', color: '#A89FCC' },
  { value: 'happy', label: 'Happy 😄', emoji: '😄', color: '#C4BAE8' },
];

const PlaylistPage = ({ currentMood, onMoodChange }) => {
  const { selectTrack, currentTrack, playlist } = useMusicPlayer();
  const [sortBy, setSortBy] = useState('default');

  const handleMoodSelect = (mood) => {
    onMoodChange(mood);
  };

  const sortedPlaylist = [...playlist].sort((a, b) => {
    if (sortBy === 'duration') {
      return a.duration - b.duration;
    } else if (sortBy === 'artist') {
      return a.artist.localeCompare(b.artist);
    }
    return 0;
  });

  const currentMoodOption = MOOD_OPTIONS.find(m => m.value === currentMood);

  return (
    <div className="playlist-page">
      {/* Mood Selector */}
      <div className="mood-selector-section">
        <h2>Select Mood</h2>
        <div className="mood-buttons">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              className={`mood-btn ${currentMood === mood.value ? 'active' : ''}`}
              onClick={() => handleMoodSelect(mood.value)}
              title={mood.label}
              style={{
                '--mood-color': mood.color
              }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-text">{mood.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort & Filter Options */}
      <div className="sort-section">
        <label htmlFor="sort-select">Sort by:</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="default">Default</option>
          <option value="duration">Duration</option>
          <option value="artist">Artist</option>
        </select>
      </div>

      {/* Playlist Tracks */}
      <div className="tracks-section">
        <h3>Tracks for {currentMoodOption?.label}</h3>
        <div className="tracks-list">
          {sortedPlaylist.map((track, index) => (
            <div
              key={track.id}
              className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
              onClick={() => selectTrack(index)}
            >
              <div className="track-number">{index + 1}</div>
              <div className="track-info">
                <h4 className="track-title">{track.title}</h4>
                <p className="track-artist">{track.artist}</p>
              </div>
              <div className="track-duration">
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </div>
              {currentTrack?.id === track.id && (
                <div className="playing-indicator">
                  <span className="music-note">♪</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Playlist Stats */}
      <div className="playlist-stats">
        <div className="stat">
          <span className="stat-label">Total Tracks:</span>
          <span className="stat-value">{sortedPlaylist.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Duration:</span>
          <span className="stat-value">
            {Math.floor(sortedPlaylist.reduce((sum, t) => sum + t.duration, 0) / 60)} min
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
