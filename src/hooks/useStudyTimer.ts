import { useState, useEffect } from 'react';
import { useStudyStore } from '@/store/useStudyStore';

const CYCLE_SECONDS = 25 * 60;

export function useStudyTimer() {
  const timerState = useStudyStore((s) => s.timerState);
  const startedAt = useStudyStore((s) => s.startedAt);
  const accumulatedSeconds = useStudyStore((s) => s.accumulatedSeconds);
  const startTimer = useStudyStore((s) => s.startTimer);
  const pauseTimer = useStudyStore((s) => s.pauseTimer);
  const stopTimer = useStudyStore((s) => s.stopTimer);
  const resetTimer = useStudyStore((s) => s.resetTimer);

  // Tick state just to force re-renders every second while studying
  const [, setTick] = useState(0);

  useEffect(() => {
    if (timerState !== 'studying') return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerState]);

  const elapsedSeconds =
    timerState === 'studying' && startedAt !== null
      ? Math.floor((Date.now() - startedAt) / 1000)
      : accumulatedSeconds;

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
