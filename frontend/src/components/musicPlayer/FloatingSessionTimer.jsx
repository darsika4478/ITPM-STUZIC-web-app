import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMusicPlayer } from '../../context/useMusicPlayer';

const FloatingSessionTimer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studySessionActive, studyTimeLeft, studyConfig } = useMusicPlayer();

  // Don't show if session is not active or if we are already on the study session page
  if (!studySessionActive || location.pathname === '/dashboard/study-session') {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      onClick={() => navigate('/dashboard/study-session')}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] cursor-pointer group"
    >
      <div className="relative flex items-center">
        {/* Label pop-out on hover */}
        <div className="absolute right-full mr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 pointer-events-none">
          <div className="bg-[#1c1848]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl whitespace-nowrap shadow-2xl">
            <p className="text-[10px] text-purple-300/60 uppercase font-bold tracking-widest leading-none mb-1">Focusing on</p>
            <p className="text-white text-sm font-bold">{studyConfig.goal || 'Study Session'}</p>
          </div>
        </div>

        {/* The Pill */}
        <div className="bg-gradient-to-b from-[#585296] to-[#3C436B] p-1 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/20 hover:scale-110 transition-all duration-300 active:scale-95">
          <div className="bg-[#1c1848]/40 backdrop-blur-xl rounded-full py-4 px-3 flex flex-col items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg animate-pulse">
               🧠
             </div>
             <div className="h-px w-6 bg-white/10"></div>
             <div className="writing-vertical text-white font-mono font-bold tracking-tighter text-sm">
               {formatTime(studyTimeLeft)}
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default FloatingSessionTimer;
