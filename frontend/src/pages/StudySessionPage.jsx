import { useState, useEffect } from 'react';
import { useMusicPlayer } from '../context/useMusicPlayer';
import SessionConfigForm from '../components/MusicSessionModule/SessionConfigForm';

const StudySessionPage = () => {
  const { nowPlaying } = useMusicPlayer();
  
  // Timer state
  const [sessionDuration, setSessionDuration] = useState(30); // minutes
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // seconds
  const [timeError, setTimeError] = useState('');

  const MIN_DURATION = 1;
  const MAX_DURATION = 480; // 8 hours
  
  // Song tracking
  const [songsPlayed, setSongsPlayed] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  // Session details from config form
  const [sessionConfig, setSessionConfig] = useState({
    sessionType: 'Deep Work',
    goal: '',
    subject: '',
    topic: '',
    focusLevel: 'Medium',
    breakReminder: true
  });

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
    // Basic validation before starting
    if (timeError) {
      alert(`Invalid duration: ${timeError}`);
      return;
    }

    if (!sessionConfig.goal.trim() || !sessionConfig.subject.trim() || !sessionConfig.topic.trim()) {
      alert('Please complete all session configuration fields (Goal, Subject, and Topic) before starting!');
      return;
    }
    
    setTimeLeft(sessionDuration * 60);
    setSessionStartTime(new Date());
    setSongsPlayed([]);
    setIsActive(true);
  };

  const handleConfigSubmit = (config) => {
    setSessionConfig(config);
    // You could show a small toast or notification here
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
    const val = e.target.value;
    const newDuration = parseInt(val);
    
    if (val === '') {
      setSessionDuration('');
      setTimeError('Duration is required');
      return;
    }

    setSessionDuration(newDuration);

    if (isNaN(newDuration)) {
      setTimeError('Please enter a valid number');
    } else if (newDuration < MIN_DURATION) {
      setTimeError(`Minimum duration is ${MIN_DURATION} minute`);
    } else if (newDuration > MAX_DURATION) {
      setTimeError(`Maximum duration is ${MAX_DURATION} minutes (8 hours)`);
    } else {
      setTimeError('');
      if (!isActive) {
        setTimeLeft(newDuration * 60);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-white">Study Session</h1>

      {/* Main Timer Section */}
      {/* Primary Session Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Timer Display */}
        <div className="bg-gradient-to-br from-[#3C436B] to-[#585296] rounded-3xl p-8 border border-[#8F8BB6]/30 shadow-2xl h-full flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-[#B6B4BB] text-sm font-semibold mb-4 uppercase tracking-wider">Session Timer</h2>
            <div className="text-7xl font-bold text-white font-mono mb-6 bg-[#272D3E] rounded-2xl py-6 shadow-inner border border-[#585296]/30">
              {formatTime(timeLeft)}
            </div>
            
            {/* Duration Input */}
            <div className="mb-6 relative">
              <label className="text-[#B6B4BB] text-sm block mb-3">Session Duration (minutes)</label>
              <input
                type="number"
                min={MIN_DURATION}
                max={MAX_DURATION}
                value={sessionDuration}
                onChange={handleDurationChange}
                disabled={isActive}
                className={`w-full px-4 py-3 bg-[#272D3E] border rounded-lg text-white text-center font-semibold focus:outline-none transition-all ${
                  timeError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#585296]/50 focus:border-[#8F8BB6]'
                } disabled:opacity-50`}
              />
              {timeError && (
                <p className="text-red-400 text-[10px] mt-1 absolute -bottom-4 left-0 right-0 text-center animate-pulse">
                  ⚠️ {timeError}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              {!isActive ? (
                <button
                  onClick={handleStartSession}
                  className="px-6 py-3 bg-[#585296] hover:bg-[#6d5fe7] text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg border border-white/10"
                >
                  ▶ Start Session
                </button>
              ) : (
                <button
                  onClick={handleStopSession}
                  className="px-6 py-3 bg-red-600/80 hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg border border-white/10"
                >
                  ⏸ Stop Session
                </button>
              )}
              <button
                onClick={handleResetSession}
                className="px-6 py-3 bg-[#3C436B] hover:bg-[#4d5379] text-white font-semibold rounded-lg transition-all shadow-lg border border-white/10"
              >
                ↻ Reset
              </button>
            </div>

            {/* Status */}
            <div className="mt-6 pt-6 border-t border-[#8F8BB6]/20">
              <p className="text-[#B6B4BB] text-sm flex items-center justify-center gap-2">
                {isActive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span>Session Active - GO!</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    <span>Ready to focus?</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-1">
          <SessionConfigForm 
            onConfigSubmit={handleConfigSubmit} 
            isSessionActive={isActive} 
          />
        </div>

        {/* Currently Playing & Active Goal */}
        <div className="bg-gradient-to-br from-[#3C436B] to-[#585296] rounded-3xl p-8 border border-[#8F8BB6]/30 shadow-2xl flex flex-col">
          <div className="flex-1">
            <h2 className="text-[#B6B4BB] text-sm font-semibold mb-4 uppercase tracking-wider">Now Playing</h2>
            {nowPlaying && isActive ? (
              <div className="bg-[#272D3E] rounded-2xl p-6 text-center border border-[#585296]/30">
                <div className="text-5xl mb-4 animate-bounce-slow">🎵</div>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{nowPlaying.title}</h3>
                <p className="text-[#B6B4BB] mb-4 line-clamp-1">{nowPlaying.artist}</p>
                <div className="inline-block px-3 py-1 bg-[#585296]/50 rounded-full text-xs text-[#8F8BB6] font-medium">
                  {sessionConfig.sessionType}
                </div>
              </div>
            ) : (
              <div className="bg-[#272D3E] rounded-2xl p-6 h-40 flex items-center justify-center text-center text-[#8F8BB6] border border-dashed border-[#585296]/50">
                <div>
                  <p className="mb-2">🎵</p>
                  <p className="text-sm">
                    {isActive ? 'No track currently playing' : 'Start a session to sync music'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {sessionConfig.goal && (
            <div className="mt-6 pt-6 border-t border-[#8F8BB6]/20">
              <h4 className="text-[#B6B4BB] text-xs font-semibold mb-2 uppercase">Current Session</h4>
              <p className="text-white text-lg font-medium italic mb-1">"{sessionConfig.goal}"</p>
              <div className="flex gap-2 text-xs">
                <span className="text-[#8F8BB6] bg-[#272D3E] px-2 py-0.5 rounded">📚 {sessionConfig.subject}</span>
                <span className="text-[#8F8BB6] bg-[#272D3E] px-2 py-0.5 rounded">🎯 {sessionConfig.topic}</span>
              </div>
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
