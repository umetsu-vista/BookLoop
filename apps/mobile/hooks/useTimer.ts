import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { useSessionStore } from '@/stores/session';

export function useTimer() {
  const { startedAt, isPaused, updateElapsed, elapsedSeconds } = useSessionStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedElapsedRef = useRef(0);

  const calculateElapsed = useCallback(() => {
    if (!startedAt) return 0;
    const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return Math.max(diff, 0);
  }, [startedAt]);

  useEffect(() => {
    if (!startedAt || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (isPaused) {
        pausedElapsedRef.current = elapsedSeconds;
      }
      return;
    }

    updateElapsed(calculateElapsed());

    intervalRef.current = setInterval(() => {
      updateElapsed(calculateElapsed());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startedAt, isPaused, calculateElapsed, updateElapsed]);

  // バックグラウンド復帰時に差分計算
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && startedAt && !isPaused) {
        updateElapsed(calculateElapsed());
      }
    });
    return () => sub.remove();
  }, [startedAt, isPaused, calculateElapsed, updateElapsed]);

  return { elapsedSeconds };
}
