import { useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/session';
import type { ReadingSession } from '@bookloop/shared';

export function useSession() {
  const { token } = useAuthStore();
  const { setActiveSession, clearSession, setPaused } = useSessionStore();

  const startSession = useCallback(
    async (bookId: string, bookTitle: string, sessionType: string, externalApp?: string) => {
      if (!token) return;
      const res = await apiClient<{ data: ReadingSession }>('/sessions', {
        method: 'POST',
        body: { userBookId: bookId, sessionType, externalApp },
        token,
      });
      setActiveSession({
        sessionId: res.data.id,
        bookId: res.data.bookId,
        bookTitle,
        sessionType: res.data.sessionType,
        externalApp: res.data.externalApp ?? undefined,
        startedAt: res.data.startedAt,
      });
      return res.data;
    },
    [token, setActiveSession],
  );

  const pauseSession = useCallback(
    async (sessionId: string) => {
      if (!token) return;
      await apiClient(`/sessions/${sessionId}/pause`, { method: 'POST', token });
      setPaused(true);
    },
    [token, setPaused],
  );

  const resumeSession = useCallback(
    async (sessionId: string) => {
      if (!token) return;
      await apiClient(`/sessions/${sessionId}/resume`, { method: 'POST', token });
      setPaused(false);
    },
    [token, setPaused],
  );

  const endSession = useCallback(
    async (sessionId: string, pageStart?: number, pageEnd?: number, memo?: string) => {
      if (!token) return;
      const res = await apiClient<{ data: ReadingSession }>(`/sessions/${sessionId}/end`, {
        method: 'POST',
        body: { pageStart, pageEnd, memo },
        token,
      });
      clearSession();
      return res.data;
    },
    [token, clearSession],
  );

  const discardSession = useCallback(
    async (sessionId: string) => {
      if (!token) return;
      await apiClient(`/sessions/${sessionId}`, { method: 'DELETE', token });
      clearSession();
    },
    [token, clearSession],
  );

  const checkActiveSession = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await apiClient<{ data: ReadingSession | null }>('/sessions/active', { token });
      return res.data;
    } catch {
      return null;
    }
  }, [token]);

  return {
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    discardSession,
    checkActiveSession,
  };
}
