import { useState } from 'react';
import { useMusicPlayer } from '../context/useMusicPlayer';

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
    <div className="flex flex-col gap-6 md:gap-4 sm:gap-3 w-full h-full overflow-y-auto p-1">
      {/* Mood Selector */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-purple-200/80 m-0 uppercase tracking-wider">Select Mood</h2>
        <div className="flex flex-col gap-2">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all duration-200 text-xs font-semibold text-purple-100 backdrop-blur-lg relative overflow-hidden ${
                currentMood === mood.value
                  ? 'bg-purple-900/25 text-white shadow-lg'
                  : 'border-purple-400/20 bg-purple-950/20 hover:border-purple-400/40 hover:bg-purple-900/15'
              }`}
              onClick={() => handleMoodSelect(mood.value)}
              title={mood.label}
              style={{
                borderColor: currentMood === mood.value ? mood.color : 'rgba(143, 139, 182, 0.2)',
              }}
            >
              <span className="text-4xl">{mood.emoji}</span>
              <span className="flex-1 text-left">{mood.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort & Filter Options */}
      <div className="flex gap-3 items-center px-3.5 py-3 bg-purple-950/20 rounded-xl border border-purple-400/10 backdrop-blur-lg sm:gap-2">
        <label htmlFor="sort-select" className="font-semibold text-purple-200/80 text-xs uppercase tracking-wider">Sort by:</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-2.5 py-2 border border-purple-400/20 rounded-lg bg-purple-950/60 text-purple-100 cursor-pointer text-xs transition-all duration-200 flex-1 hover:border-purple-400/40 hover:bg-purple-950/80 focus:outline-none"
        >
          <option value="default">Default</option>
          <option value="duration">Duration</option>
          <option value="artist">Artist</option>
        </select>
      </div>

      {/* Playlist Tracks */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-purple-200/80 m-0 uppercase tracking-wider">Tracks for {currentMoodOption?.label}</h3>
        <div className="flex flex-col gap-1.5 max-h-70 md:max-h-60 sm:max-h-50 overflow-y-auto">
          {sortedPlaylist.map((track, index) => (
            <div
              key={track.id}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 relative overflow-hidden ${
                currentTrack?.id === track.id
                  ? 'bg-purple-900/20 border border-purple-400/30 shadow-inner'
                  : 'bg-purple-950/20 border border-purple-400/10 hover:bg-purple-900/15 hover:border-purple-400/20'
              }`}
              onClick={() => selectTrack(index)}
            >
              <div className="w-6 text-center font-bold text-purple-200/60 text-2xs">{index + 1}</div>
              <div className="flex-1 min-w-0">
                <h4 className="m-0 text-xs font-semibold text-purple-100 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">{track.title}</h4>
                <p className="m-0 text-2xs text-purple-200/60 whitespace-nowrap overflow-hidden text-ellipsis">{track.artist}</p>
              </div>
              <div className="text-2xs text-purple-200/60 whitespace-nowrap font-semibold">
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </div>
              {currentTrack?.id === track.id && (
                <div className="w-5 h-5 flex items-center justify-center text-purple-400 animate-musicBounce">
                  <span className="text-base">♪</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Playlist Stats */}
      <div className="flex gap-4 md:gap-3 sm:gap-2 px-3.5 py-3 bg-purple-950/20 rounded-xl border border-purple-400/10 backdrop-blur-lg flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-2xs text-purple-200/60 uppercase tracking-wider font-semibold">Total Tracks:</span>
          <span className="text-sm font-bold text-purple-400">{sortedPlaylist.length}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xs text-purple-200/60 uppercase tracking-wider font-semibold">Total Duration:</span>
          <span className="text-sm font-bold text-purple-400">
            {Math.floor(sortedPlaylist.reduce((sum, t) => sum + t.duration, 0) / 60)} min
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
