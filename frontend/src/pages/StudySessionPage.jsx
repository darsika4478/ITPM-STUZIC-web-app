import { useState, useEffect } from 'react';
import { useMusicPlayer } from '../context/useMusicPlayer';

const StudySessionPage = () => {
  const { nowPlaying } = useMusicPlayer();
  
  // Timer state
  const [sessionDuration, setSessionDuration] = useState(30); // minutes
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // seconds
  
  // Song tracking
  const [songsPlayed, setSongsPlayed] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Format time display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Track when a new song starts playing
  useEffect(() => {
    if (isActive && nowPlaying && sessionStartTime) {
      const existingSong = songsPlayed.find(s => s.id === nowPlaying.id);
      if (!existingSong) {
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - sessionStartTime) / 1000);
        setSongsPlayed([...songsPlayed, {
          id: nowPlaying.id,
          title: nowPlaying.title,
          artist: nowPlaying.artist,
          startTime: elapsedSeconds,
          playedAt: currentTime.toLocaleTimeString()
        }]);
      }
    }
  }, [nowPlaying, isActive, sessionStartTime, songsPlayed]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStartSession = () => {
    setTimeLeft(sessionDuration * 60);
    setSessionStartTime(new Date());
    setSongsPlayed([]);
    setIsActive(true);
  };

  const handleStopSession = () => {
    setIsActive(false);
  };

  const handleResetSession = () => {
    setIsActive(false);
    setTimeLeft(sessionDuration * 60);
    setSessionStartTime(null);
    setSongsPlayed([]);
  };

  const handleDurationChange = (e) => {
    const newDuration = Math.max(1, Math.min(180, parseInt(e.target.value) || 1));
    setSessionDuration(newDuration);
    if (!isActive) {
      setTimeLeft(newDuration * 60);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-white">Study Session</h1>

      {/* Main Timer Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Timer Display */}
        <div className="bg-gradient-to-br from-[#3C436B] to-[#585296] rounded-3xl p-8 border border-[#8F8BB6]/30 shadow-2xl">
          <div className="text-center">
            <h2 className="text-[#B6B4BB] text-sm font-semibold mb-4 uppercase tracking-wider">Session Timer</h2>
            <div className="text-7xl font-bold text-white font-mono mb-6 bg-[#272D3E] rounded-2xl py-6">
              {formatTime(timeLeft)}
            </div>
            
            {/* Duration Input */}
            <div className="mb-6">
              <label className="text-[#B6B4BB] text-sm block mb-3">Session Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="180"
                value={sessionDuration}
                onChange={handleDurationChange}
                disabled={isActive}
                className="w-full px-4 py-3 bg-[#272D3E] border border-[#585296]/50 rounded-lg text-white text-center font-semibold focus:outline-none focus:border-[#8F8BB6] transition-colors disabled:opacity-50"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              {!isActive ? (
                <button
                  onClick={handleStartSession}
                  className="px-6 py-3 bg-[#585296] hover:bg-[#6d5fe7] text-white font-semibold rounded-lg transition-colors"
                >
                  ▶ Start Session
                </button>
              ) : (
                <button
                  onClick={handleStopSession}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  ⏸ Stop Session
                </button>
              )}
              <button
                onClick={handleResetSession}
                className="px-6 py-3 bg-[#3C436B] hover:bg-[#4d5379] text-white font-semibold rounded-lg transition-colors"
              >
                ↻ Reset
              </button>
            </div>

            {/* Status */}
            <div className="mt-6 pt-6 border-t border-[#8F8BB6]/20">
              <p className="text-[#B6B4BB] text-sm">
                {isActive ? '🔴 Session Active' : '⚫ Session Inactive'}
              </p>
            </div>
          </div>
        </div>

        {/* Currently Playing */}
        <div className="bg-gradient-to-br from-[#3C436B] to-[#585296] rounded-3xl p-8 border border-[#8F8BB6]/30 shadow-2xl">
          <h2 className="text-[#B6B4BB] text-sm font-semibold mb-4 uppercase tracking-wider">Now Playing</h2>
          {nowPlaying && isActive ? (
            <div className="bg-[#272D3E] rounded-2xl p-6 text-center">
              <div className="text-5xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-white mb-2">{nowPlaying.title}</h3>
              <p className="text-[#B6B4BB] mb-4">{nowPlaying.artist}</p>
              <div className="text-sm text-[#8F8BB6]">Playing during session</div>
            </div>
          ) : (
            <div className="bg-[#272D3E] rounded-2xl p-6 text-center text-[#8F8BB6]">
              {isActive ? 'No track currently playing' : 'Start a session to see now playing'}
            </div>
          )}
        </div>
      </div>

      {/* Songs Played Section */}
      <div className="bg-gradient-to-br from-[#3C436B] to-[#585296] rounded-3xl p-8 border border-[#8F8BB6]/30 shadow-2xl">
        <h2 className="text-[#B6B4BB] text-sm font-semibold mb-6 uppercase tracking-wider">
          🎵 Songs Played ({songsPlayed.length})
        </h2>

        {songsPlayed.length > 0 ? (
          <div className="space-y-3">
            {songsPlayed.map((song, index) => (
              <div
                key={index}
                className="bg-[#272D3E] rounded-xl p-4 border border-[#585296]/30 hover:border-[#8F8BB6]/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-[#8F8BB6]">#{index + 1}</span>
                      <h4 className="font-semibold text-white">{song.title}</h4>
                    </div>
                    <p className="text-[#B6B4BB] text-sm">{song.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#8F8BB6] text-xs">{song.playedAt}</p>
                    <p className="text-[#585296] text-xs mt-1">Start: {song.startTime}s</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#272D3E] rounded-xl p-8 text-center">
            <p className="text-[#8F8BB6]">No songs played yet. Start a session and begin listening!</p>
          </div>
        )}
      </div>

      {/* Session Summary */}
      {songsPlayed.length > 0 && (
        <div className="mt-8 bg-[#272D3E] rounded-3xl p-6 border border-[#8F8BB6]/20">
          <h3 className="text-white font-semibold mb-4">Session Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#3C436B] rounded-lg p-4 text-center">
              <p className="text-[#B6B4BB] text-xs uppercase mb-2">Total Songs</p>
              <p className="text-2xl font-bold text-white">{songsPlayed.length}</p>
            </div>
            <div className="bg-[#3C436B] rounded-lg p-4 text-center">
              <p className="text-[#B6B4BB] text-xs uppercase mb-2">Duration</p>
              <p className="text-2xl font-bold text-white">{sessionDuration}m</p>
            </div>
            <div className="bg-[#3C436B] rounded-lg p-4 text-center">
              <p className="text-[#B6B4BB] text-xs uppercase mb-2">Status</p>
              <p className="text-2xl font-bold text-white">{isActive ? '🔴' : '✅'}</p>
            </div>
            <div className="bg-[#3C436B] rounded-lg p-4 text-center">
              <p className="text-[#B6B4BB] text-xs uppercase mb-2">Time Left</p>
              <p className="text-2xl font-bold text-white">{formatTime(timeLeft)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySessionPage;
