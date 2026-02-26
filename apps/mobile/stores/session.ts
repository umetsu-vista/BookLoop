import { create } from 'zustand';

interface SessionState {
  activeSessionId: string | null;
  bookId: string | null;
  bookTitle: string | null;
  sessionType: string | null;
  externalApp: string | null;
  startedAt: string | null;
  isPaused: boolean;
  elapsedSeconds: number;
  setActiveSession: (data: {
    sessionId: string;
    bookId: string;
    bookTitle: string;
    sessionType: string;
    externalApp?: string;
    startedAt: string;
  }) => void;
  updateElapsed: (seconds: number) => void;
  setPaused: (paused: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  bookId: null,
  bookTitle: null,
  sessionType: null,
  externalApp: null,
  startedAt: null,
  isPaused: false,
  elapsedSeconds: 0,
  setActiveSession: (data) =>
    set({
      activeSessionId: data.sessionId,
      bookId: data.bookId,
      bookTitle: data.bookTitle,
      sessionType: data.sessionType,
      externalApp: data.externalApp ?? null,
      startedAt: data.startedAt,
      isPaused: false,
      elapsedSeconds: 0,
    }),
  updateElapsed: (seconds) => set({ elapsedSeconds: seconds }),
  setPaused: (isPaused) => set({ isPaused }),
  clearSession: () =>
    set({
      activeSessionId: null,
      bookId: null,
      bookTitle: null,
      sessionType: null,
      externalApp: null,
      startedAt: null,
      isPaused: false,
      elapsedSeconds: 0,
    }),
}));
