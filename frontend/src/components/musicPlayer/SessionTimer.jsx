// SessionTimer.jsx – Pomodoro-style focus / break timer UI
import { useSessionTimer } from "../../hooks/useSessionTimer";

const PHASE_COLORS = {
  focus: "text-[#585296]",
  break: "text-[#8F8BB6]",
};

export default function SessionTimer({ onSessionEnd }) {
  const {
    phase,
    formattedTime,
    isRunning,
    completedFocusCount,
    elapsedFocusMinutes,
    sessionStartTime,
    start,
    pause,
    reset,
  } = useSessionTimer();

  const handleEnd = () => {
    if (onSessionEnd) {
      onSessionEnd({
        sessionStartTime,
        elapsedFocusMinutes,
        completedFocusCount,
      });
    }
    reset();
  };

  const phaseLabel = phase === "focus" ? "🎯 Focus Time" : "☕ Break Time";
  const progressDeg = phase === "focus"
    ? (1 - (parseInt(formattedTime.split(":")[0]) * 60 + parseInt(formattedTime.split(":")[1])) / (25 * 60)) * 360
    : (1 - (parseInt(formattedTime.split(":")[0]) * 60 + parseInt(formattedTime.split(":")[1])) / (5 * 60)) * 360;

  const getGradientColor = () => phase === "focus" ? "#585296" : "#8F8BB6";

  return (
    <div className="flex flex-col items-center gap-5 p-6 bg-[#3C436B] rounded-3xl border border-[#8F8BB6]/20 shadow-lg w-full">
      {/* Phase label */}
      <p className={`m-0 font-bold text-sm tracking-widest uppercase ${PHASE_COLORS[phase]}`}>
        {phaseLabel}
      </p>

      {/* Circular timer display */}
      <div
        className="w-40 h-40 rounded-full flex items-center justify-center p-1 shadow-inner relative"
        style={{
          background: `conic-gradient(${getGradientColor()} ${progressDeg}deg, rgba(60,67,107,0.4) ${progressDeg}deg)`,
          transition: "background 1s linear"
        }}
      >
        <div className="w-full h-full rounded-full bg-[#272D3E] flex items-center justify-center shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] border border-[#3C436B]">
          <span className="text-4xl font-extrabold text-[#B6B4BB] tracking-wider tabular-nums">
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-3 justify-center w-full mt-2">
        {!isRunning ? (
          <button 
            id="timer-start" 
            onClick={start} 
            className="px-6 py-2.5 rounded-xl border-none text-white font-semibold text-sm cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#585296] to-[#8F8BB6] hover:scale-105 hover:shadow-lg"
          >
            {sessionStartTime ? "Resume" : "Start Focus"}
          </button>
        ) : (
          <button 
            id="timer-pause" 
            onClick={pause} 
            className="px-6 py-2.5 rounded-xl border border-[#8F8BB6] text-[#B6B4BB] font-semibold text-sm cursor-pointer transition-all duration-300 bg-[#3C436B] hover:bg-[#8F8BB6]/10 hover:text-white"
          >
            Pause
          </button>
        )}
        <button 
          id="timer-reset" 
          onClick={reset} 
          className="px-5 py-2.5 rounded-xl border border-[#8F8BB6]/30 bg-transparent text-[#8F8BB6] font-semibold text-sm cursor-pointer hover:bg-[#8F8BB6]/10 hover:border-[#8F8BB6]/50 transition-all"
        >
          Reset
        </button>
        {sessionStartTime && (
          <button 
            id="timer-end" 
            onClick={handleEnd} 
            className="px-5 py-2.5 rounded-xl border border-red-400/30 bg-transparent text-red-400 font-semibold text-sm cursor-pointer hover:bg-red-400/10 hover:border-red-400/60 transition-all ml-auto sm:ml-0 w-full sm:w-auto mt-2 sm:mt-0"
          >
            End Session
          </button>
        )}
      </div>

      {/* Session stats */}
      {completedFocusCount > 0 && (
        <div className="flex flex-wrap justify-center gap-4 text-sm text-[#8F8BB6] font-medium mt-2 bg-[#272D3E]/50 px-4 py-2 rounded-xl">
          <span>✅ {completedFocusCount} block{completedFocusCount !== 1 ? "s" : ""} done</span>
          <span>⏱ {elapsedFocusMinutes} min focused</span>
        </div>
      )}
    </div>
  );
}
