import React from 'react';

export default function SessionTimer({ 
  isActive, 
  duration, 
  timeLeft, 
  startSession, 
  stopSession, 
  error 
}) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6 text-center">
      <h2 className="text-xl font-bold text-white mb-4">Focus Session</h2>
      <div className="text-5xl font-extrabold text-[#585296] bg-white/5 rounded-2xl py-6 mb-6">
        {formatTime(timeLeft)}
      </div>
      
      {isActive && (
        <p className="text-red-400 text-sm mb-4 font-semibold">Session already in progress</p>
      )}

      <div className="flex justify-center gap-4">
        <button
          onClick={startSession}
          disabled={isActive || error || !duration}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
            isActive || error || !duration
              ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
              : "bg-[#585296] text-white hover:bg-[#8F8BB6]"
          }`}
        >
          Start
        </button>
        <button
          onClick={stopSession}
          disabled={!isActive}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
            !isActive
              ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
              : "bg-red-500/80 text-white hover:bg-red-400"
          }`}
        >
          Stop
        </button>
      </div>
    </div>
  );
}
