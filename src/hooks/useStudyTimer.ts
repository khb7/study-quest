import { useState, useEffect, useRef, useCallback } from 'react';

type TimerState = 'idle' | 'studying' | 'paused';

interface UseStudyTimerReturn {
  timerState: TimerState;
  elapsedSeconds: number;
  formattedTime: string;
  progress: number;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

const CYCLE_SECONDS = 25 * 60;

export function useStudyTimer(): UseStudyTimerReturn {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimerInterval();
  }, [clearTimerInterval]);

  const startTimer = useCallback(() => {
    setTimerState('studying');
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState('paused');
    clearTimerInterval();
  }, [clearTimerInterval]);

  const stopTimer = useCallback(() => {
    clearTimerInterval();
    // State stays as-is; caller triggers modal then calls resetTimer
  }, [clearTimerInterval]);

  const resetTimer = useCallback(() => {
    setTimerState('idle');
    setElapsedSeconds(0);
    clearTimerInterval();
  }, [clearTimerInterval]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = CYCLE_SECONDS > 0 ? (elapsedSeconds % CYCLE_SECONDS) / CYCLE_SECONDS : 0;

  return {
    timerState,
    elapsedSeconds,
    formattedTime,
    progress,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
  };
}
