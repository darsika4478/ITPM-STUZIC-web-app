import { useState, useEffect, useRef, useCallback } from "react";

const FOCUS_SECONDS = 25 * 60; // 25 minutes
const BREAK_SECONDS = 5 * 60;  // 5 minutes

/**
 * useSessionTimer – Pomodoro-style focus/break timer
 * Returns timer state and controls.
 */
export function useSessionTimer() {
  const [phase, setPhase] = useState("focus"); // "focus" | "break"
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [completedFocusCount, setCompletedFocusCount] = useState(0);

  const intervalRef = useRef(null);

  // Tick down every second when running
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Phase complete – switch phase
          setPhase((currentPhase) => {
            if (currentPhase === "focus") {
              setCompletedFocusCount((c) => c + 1);
              setSecondsLeft(BREAK_SECONDS);
              return "break";
            } else {
              setSecondsLeft(FOCUS_SECONDS);
              return "focus";
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const start = useCallback(() => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }
    setIsRunning(true);
  }, [sessionStartTime]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setPhase("focus");
    setSecondsLeft(FOCUS_SECONDS);
    setSessionStartTime(null);
    setCompletedFocusCount(0);
  }, []);

  // Format seconds → "MM:SS"
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Total elapsed focus time in minutes (for session save)
  const elapsedFocusMinutes = completedFocusCount * 25;

  return {
    phase,
    secondsLeft,
    isRunning,
    sessionStartTime,
    completedFocusCount,
    elapsedFocusMinutes,
    formattedTime: formatTime(secondsLeft),
    start,
    pause,
    reset,
  };
}
