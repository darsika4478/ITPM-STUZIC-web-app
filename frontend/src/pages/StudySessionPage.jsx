import { useState, useEffect } from 'react';
import { useMusicPlayer } from '../context/useMusicPlayer';
import SessionConfigForm from '../components/MusicSessionModule/SessionConfigForm';
import { auth } from '../config/firebase';
import * as sessionService from '../firebase/sessionService';

const StudySessionPage = () => {
  const { 
    currentTrack,
    isPlaying,
    studySessionActive,
    setStudySessionActive,
    studyTimeLeft,
    setStudyTimeLeft,
    studyDuration,
    setStudyDuration,
    studyConfig,
    setStudyConfig,
    studySongsPlayed,
    setStudySongsPlayed,
    studySessionId,
    setStudySessionId,
    showStudyEndedModal,
    setShowStudyEndedModal,
    sessionStartTime,
    setSessionStartTime
  } = useMusicPlayer();
  
  const [timeError, setTimeError] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const MIN_DURATION = 1;
  const MAX_DURATION = 480; // 8 hours

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

  const handleStartSession = () => {
    // If resuming from pause
    if (isPaused && studyTimeLeft > 0) {
      setIsPaused(false);
      setSessionStartTime(new Date()); // Update start time for resume
      setStudySessionActive(true);
      return;
    }

    // Basic validation before starting
    if (timeError) {
      alert(`Invalid duration: ${timeError}`);
      return;
    }

    if (!studyConfig.goal.trim() || !studyConfig.subject.trim() || !studyConfig.topic.trim()) {
      alert('Please complete all session configuration fields (Goal, Subject, and Topic) before starting!');
      return;
    }
    
    setStudyTimeLeft(studyDuration * 60);
    setSessionStartTime(new Date());
    setStudySongsPlayed([]);
    setStudySessionActive(true);
    setIsPaused(false);

    // Start backend session
    if (auth.currentUser) {
      const moodValue = 3; // Default or derive from player
      const sessionData = {
        title: `Study: ${studyConfig.goal}`,
        goal: studyConfig.goal,
        subject: studyConfig.subject,
        topic: studyConfig.topic,
        sessionType: studyConfig.sessionType,
        activity: 'studying'
      };
      
      sessionService.startSession(
        auth.currentUser.uid,
        moodValue,
        sessionData
      ).then(id => setStudySessionId(id));
    }
  };

  const handlePauseSession = () => {
    setStudySessionActive(false);
    setIsPaused(true);
  };

  const handleResetSession = () => {
    setStudySessionActive(false);
    setIsPaused(false);
    setStudyTimeLeft(studyDuration * 60);
    setSessionStartTime(null);
    setStudySongsPlayed([]);
    
    // End backend session if active
    if (studySessionId) {
      const elapsedSeconds = sessionStartTime 
        ? Math.floor((new Date() - sessionStartTime) / 1000)
        : 0;
      sessionService.endSession(studySessionId, elapsedSeconds);
      setStudySessionId(null);
    }
  };

  const handleConfigSubmit = (config) => {
    setStudyConfig(config);
  };

  const handleDurationChange = (e) => {
    const val = e.target.value;
    const newDuration = parseInt(val);
    
    if (val === '') {
      setStudyDuration('');
      setTimeError('Duration is required');
      return;
    }

    setStudyDuration(newDuration);

    if (isNaN(newDuration)) {
      setTimeError('Please enter a valid number');
    } else if (newDuration < MIN_DURATION) {
      setTimeError(`Minimum duration is ${MIN_DURATION} minute`);
    } else if (newDuration > MAX_DURATION) {
      setTimeError(`Maximum duration is ${MAX_DURATION} minutes (8 hours)`);
    } else {
      setTimeError('');
      if (!studySessionActive) {
        setStudyTimeLeft(newDuration * 60);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-24">
      <h1 className="text-4xl font-bold mb-8 text-white">Study Session</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Timer Display */}
        <div className="bg-gradient-to-br from-[#3C436B] to-[#585296] rounded-3xl p-8 border border-[#8F8BB6]/30 shadow-2xl h-full flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-[#B6B4BB] text-sm font-semibold mb-4 uppercase tracking-wider">Session Timer</h2>
            <div className="w-full text-white font-bold font-mono mb-6 bg-[#272D3E] rounded-2xl py-6 shadow-inner border border-[#585296]/30 flex items-center justify-center min-h-[120px] overflow-hidden">
              <div className={`text-center whitespace-nowrap overflow-hidden text-ellipsis ${
                studyTimeLeft >= 3600 
                  ? 'text-5xl sm:text-5xl md:text-6xl' 
                  : 'text-6xl sm:text-7xl'
              }`}>{formatTime(studyTimeLeft)}</div>
            </div>
            
            <div className="mb-6 relative">
              <label className="text-[#B6B4BB] text-sm block mb-3">Session Duration (minutes)</label>
              <input
                type="number"
                min={MIN_DURATION}
                max={MAX_DURATION}
                value={studyDuration}
                onChange={handleDurationChange}
                disabled={studySessionActive}
                className={`w-full px-4 py-3 bg-[#272D3E] border rounded-lg text-white text-center font-semibold focus:outline-none transition-all overflow-hidden ${
                  timeError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#585296]/50 focus:border-[#8F8BB6]'
                } disabled:opacity-50`}
                style={{ fontSize: '1rem' }}
              />
              {timeError && (
                <p className="text-red-400 text-[10px] mt-1 absolute -bottom-4 left-0 right-0 text-center animate-pulse">
                  ⚠️ {timeError}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              {!studySessionActive ? (
                <button
                  onClick={handleStartSession}
                  className="px-6 py-3 bg-[#585296] hover:bg-[#6d5fe7] text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg border border-white/10"
                >
                  {isPaused ? '▶ Resume Session' : '▶ Start Session'}
                </button>
              ) : (
                <button
                  onClick={handlePauseSession}
                  className="px-6 py-3 bg-red-600/80 hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg border border-white/10"
                >
                  ⏸ Pause Session
                </button>
              )}
              <button
                onClick={handleResetSession}
                className="px-6 py-3 bg-[#3C436B] hover:bg-[#4d5379] text-white font-semibold rounded-lg transition-all shadow-lg border border-white/10"
              >
                ↻ Reset
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#8F8BB6]/20">
              <p className="text-[#B6B4BB] text-sm flex items-center justify-center gap-2">
                {studySessionActive ? (
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
            isSessionActive={studySessionActive} 
          />
        </div>

        {/* Currently Playing & Active Goal */}
        <div className="bg-linear-to-br from-[#3C436B] to-[#585296] rounded-3xl p-8 border border-[#8F8BB6]/30 shadow-2xl flex flex-col">
          <div className="flex-1">
            <h2 className="text-[#B6B4BB] text-sm font-semibold mb-4 uppercase tracking-wider">Now Playing</h2>
            {currentTrack && studySessionActive && isPlaying ? (
              <div className="bg-[#272D3E] rounded-2xl p-6 text-center border border-[#585296]/30">
                <div className="text-5xl mb-4 animate-bounce-slow">🎵</div>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{currentTrack.title}</h3>
                <p className="text-[#B6B4BB] mb-4 line-clamp-1">{currentTrack.artist}</p>
                <div className="inline-block px-3 py-1 bg-[#585296]/50 rounded-full text-xs text-[#8F8BB6] font-medium">
                  {studyConfig.sessionType}
                </div>
              </div>
            ) : (
              <div className="bg-[#272D3E] rounded-2xl p-6 h-40 flex items-center justify-center text-center text-[#8F8BB6] border border-dashed border-[#585296]/50">
                <div>
                  <p className="mb-2">🎵</p>
                  <p className="text-sm">
                    {studySessionActive ? 'Start music or select a track' : 'Start a session to sync music'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {studyConfig.goal && (
            <div className="mt-6 pt-6 border-t border-[#8F8BB6]/20">
              <h4 className="text-[#B6B4BB] text-xs font-semibold mb-2 uppercase">Current Session</h4>
              <p className="text-white text-lg font-medium italic mb-1">"{studyConfig.goal}"</p>
              <div className="flex gap-2 text-xs">
                <span className="text-[#8F8BB6] bg-[#272D3E] px-2 py-0.5 rounded">📚 {studyConfig.subject}</span>
                <span className="text-[#8F8BB6] bg-[#272D3E] px-2 py-0.5 rounded">🎯 {studyConfig.topic}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Songs Played Section */}
      <div className="bg-gradient-to-br from-[#3C436B] to-[#585296] rounded-3xl p-8 border border-[#8F8BB6]/30 shadow-2xl">
        <h2 className="text-[#B6B4BB] text-sm font-semibold mb-6 uppercase tracking-wider">
          🎵 Songs Played ({studySongsPlayed.length})
        </h2>

        {studySongsPlayed.length > 0 ? (
          <div className="space-y-3">
            {studySongsPlayed.map((song, index) => (
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
          <div className="bg-[#272D3E] rounded-xl p-8 text-center text-[#8F8BB6]">
            No songs played yet.
          </div>
        )}
      </div>

      {/* Session Summary */}
      {studySongsPlayed.length > 0 && (
        <div className="mt-8 bg-[#272D3E] rounded-3xl p-6 border border-[#8F8BB6]/20">
          <h3 className="text-white font-semibold mb-4">Session Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#3C436B] rounded-lg p-4 text-center">
              <p className="text-[#B6B4BB] text-xs uppercase mb-2">Total Songs</p>
              <p className="text-2xl font-bold text-white">{studySongsPlayed.length}</p>
            </div>
            <div className="bg-[#3C436B] rounded-lg p-4 text-center">
              <p className="text-[#B6B4BB] text-xs uppercase mb-2">Duration</p>
              <p className="text-2xl font-bold text-white">{studyDuration}m</p>
            </div>
            <div className="bg-[#3C436B] rounded-lg p-4 text-center">
              <p className="text-[#B6B4BB] text-xs uppercase mb-2">Status</p>
              <p className="text-2xl font-bold text-white">{studySessionActive ? '🔴' : '✅'}</p>
            </div>
            <div className="bg-[#3C436B] rounded-lg p-4 text-center">
              <p className="text-[#B6B4BB] text-xs uppercase mb-2">Time Left</p>
              <p className="text-2xl font-bold text-white">{formatTime(studyTimeLeft)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Session Complete Modal */}
      {showStudyEndedModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-gradient-to-br from-[#3C436B] to-[#585296] rounded-[32px] p-10 border border-white/20 shadow-[0_20px_100px_rgba(0,0,0,0.8)] text-center relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="text-7xl mb-6 animate-bounce-slow">✨🏆✨</div>
              <h2 className="text-3xl font-black text-white mb-2">Session Complete!</h2>
              <p className="text-purple-100/70 mb-8">
                Fantastic work! You've finished your <span className="text-white font-bold">{studyConfig.sessionType}</span> session.
              </p>
              
              <div className="bg-black/20 rounded-2xl p-6 mb-8 border border-white/5 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-purple-300/40 uppercase font-bold tracking-widest mb-1">Focus Time</p>
                    <p className="text-xl font-bold text-white">{studyDuration}m</p>
                  </div>
                   <div>
                    <p className="text-[10px] text-purple-300/40 uppercase font-bold tracking-widest mb-1">Songs Listened</p>
                    <p className="text-xl font-bold text-white">{studySongsPlayed.length}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowStudyEndedModal(false);
                  handleResetSession();
                }}
                className="w-full py-4 bg-white text-[#1c1848] font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-lg"
              >
                Done for now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
      `}</style>
    </div>
  );
};

export default StudySessionPage;
