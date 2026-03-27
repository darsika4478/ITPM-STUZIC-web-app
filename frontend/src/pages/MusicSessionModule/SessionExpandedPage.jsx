import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../layout/BaseLayout';
import SessionTimer from '../../components/MusicSessionModule/SessionTimer';
import DurationInput from '../../components/MusicSessionModule/DurationInput';

export default function SessionExpandedPage() {
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
    if (isActive) return;
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-[#B6B4BB]">Expanded Session</h1>
            <p className="text-[#8F8BB6] text-sm mt-1">Status: {isActive ? '🔴 Active' : '⚫ Idle'}</p>
          </div>
          <button 
            onClick={() => navigate('/player/session/analytics')}
            className="px-4 py-2 bg-[#585296] hover:bg-[#8F8BB6] text-white font-bold rounded-xl transition-colors"
          >
            View Session Analytics
          </button>
        </div>

        {/* Duration Input */}
        <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6">
          <DurationInput duration={duration} setDuration={setDuration} isActive={isActive} />
        </div>

        {/* Session Timer */}
        <SessionTimer 
          isActive={isActive} 
          duration={duration} 
          timeLeft={timeLeft} 
          startSession={startSession} 
          stopSession={stopSession} 
          error={error}
        />

        {/* Navigation */}
        <button 
          onClick={() => navigate('/player')}
          className="w-full py-3 bg-[#3C436B] hover:bg-[#585296] text-white font-bold rounded-2xl transition-colors border border-[#8F8BB6]/20"
        >
          ← Back to Main Player
        </button>
      </div>
    </BaseLayout>
  );
}
