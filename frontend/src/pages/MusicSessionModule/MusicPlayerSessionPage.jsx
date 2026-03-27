import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../layout/BaseLayout';
import MusicPlayer from '../../components/MusicSessionModule/MusicPlayer';
import SessionTimer from '../../components/MusicSessionModule/SessionTimer';
import DurationInput from '../../components/MusicSessionModule/DurationInput';

export default function MusicPlayerSessionPage() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState('25');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  // Validation: Check if duration is valid
  const error = duration !== '' && (isNaN(duration) || parseInt(duration) < 1 || parseInt(duration) > 120);

  // Update time when duration changes and session is not active
  useEffect(() => {
    if (!isActive) {
      const parsed = parseInt(duration, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 120) {
        setTimeLeft(parsed * 60);
      } else {
        setTimeLeft(0);
      }
    }
  }, [duration, isActive]);

  // Session timer countdown
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      alert('Session completed!');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Start session with validation
  const startSession = () => {
    if (isActive) return; // Prevent multiple active sessions
    if (!error && duration) {
      setIsActive(true);
    }
  };

  // Stop session
  const stopSession = () => {
    setIsActive(false);
  };

  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-extrabold text-[#B6B4BB]">Player & Session</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Music Player Side */}
          <div className="space-y-4">
            <MusicPlayer />
            <button 
              onClick={() => navigate('/player/music')}
              className="w-full py-3 bg-[#3C436B] hover:bg-[#585296] text-white font-bold rounded-2xl transition-colors border border-[#8F8BB6]/20"
            >
              Go to Expanded Music Page
            </button>
          </div>

          {/* Session Tracker Side */}
          <div className="space-y-4">
            <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6">
              <DurationInput duration={duration} setDuration={setDuration} isActive={isActive} />
            </div>
            <SessionTimer 
              isActive={isActive} 
              duration={duration} 
              timeLeft={timeLeft} 
              startSession={startSession} 
              stopSession={stopSession} 
              error={error}
            />
            <button 
              onClick={() => navigate('/player/session')}
              className="w-full py-3 bg-[#3C436B] hover:bg-[#585296] text-white font-bold rounded-2xl transition-colors border border-[#8F8BB6]/20"
            >
              Go to Expanded Session Page
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
