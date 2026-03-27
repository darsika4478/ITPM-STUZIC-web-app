import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../layout/BaseLayout';
import SessionTimer from '../../components/MusicSessionModule/SessionTimer';
import DurationInput from '../../components/MusicSessionModule/DurationInput';

export default function SessionExpandedPage() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState('25');
  const [isActive, setIsActive] = useState(false);
  
  const error = duration !== '' && (isNaN(duration) || duration < 1 || duration > 120);

  return (
    <BaseLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-[#B6B4BB]">Expanded Session</h1>
          <button 
            onClick={() => navigate('/player/session/analytics')}
            className="px-4 py-2 bg-[#585296] hover:bg-[#8F8BB6] text-white font-bold rounded-xl transition-colors"
          >
            View Session Analytics
          </button>
        </div>

        <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6">
          <DurationInput duration={duration} setDuration={setDuration} isActive={isActive} />
        </div>

        <SessionTimer 
          isActive={isActive} 
          duration={duration} 
          timeLeft={error ? 0 : (parseInt(duration) || 0) * 60} 
          startSession={() => setIsActive(true)} 
          stopSession={() => setIsActive(false)} 
          error={error}
        />
      </div>
    </BaseLayout>
  );
}
