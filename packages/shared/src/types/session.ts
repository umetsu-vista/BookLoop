import type { ExternalApp, SessionType } from '../constants/index';

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  sessionType: SessionType;
  externalApp: ExternalApp | null;
  startedAt: string;
  endedAt: string | null;
  durationSec: number;
  pausedTotalSec: number;
  pageStart: number | null;
  pageEnd: number | null;
  memo: string | null;
  isActive: boolean;
  isPaused: boolean;
  localDate: string;
  createdAt: string;
}

export interface SessionPause {
  id: string;
  sessionId: string;
  pausedAt: string;
  resumedAt: string | null;
  durationSec: number | null;
  createdAt: string;
}

export interface CreateSessionRequest {
  bookId: string;
  sessionType: 'TIMER' | 'EXTERNAL';
  externalApp?: ExternalApp;
  pageStart?: number;
}

export interface EndSessionRequest {
  pageStart?: number;
  pageEnd?: number;
  memo?: string;
}

export interface CreateManualSessionRequest {
  bookId: string;
  date: string;
  durationMin: number;
  pageStart?: number;
  pageEnd?: number;
  memo?: string;
}

// ── 共通サブ型 ──

export interface CompletedSessionResponse {
  id: string;
  bookId: string;
  sessionType: SessionType;
  durationSec: number;
  pausedTotalSec: number;
  wallClockSec: number;
  pageStart: number | null;
  pageEnd: number | null;
  memo: string | null;
  localDate: string;
  startedAt: string;
  endedAt: string;
}

export interface StreakUpdateResponse {
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
}

export interface DailyLogResponse {
  logDate: string;
  totalSeconds: number;
  sessionCount: number;
}

// ── API レスポンス型 ──

/** POST /sessions → 201 */
export interface SessionStartResponse {
  id: string;
  bookId: string;
  sessionType: SessionType;
  externalApp: ExternalApp | null;
  startedAt: string;
  isActive: true;
}

/** POST /sessions/:id/end → 200 */
export interface SessionEndResponse {
  session: CompletedSessionResponse;
  streak: StreakUpdateResponse;
  dailyLog: DailyLogResponse;
}

/** POST /sessions/manual → 201 */
export type ManualSessionResponse = SessionEndResponse;

/** POST /sessions/:id/pause → 200 */
export interface SessionPauseResponse {
  sessionId: string;
  pauseId: string;
  pausedAt: string;
  isPaused: true;
}

/** POST /sessions/:id/resume → 200 */
export interface SessionResumeResponse {
  sessionId: string;
  pauseId: string;
  resumedAt: string;
  pauseDurationSec: number;
  isPaused: false;
}

/** DELETE /sessions/:id → 200 */
export interface SessionDiscardResponse {
  discardedSessionId: string;
  dailyLog: DailyLogResponse | null;
  streak: StreakUpdateResponse;
}

/** POST /streaks/freeze → 200 */
export interface FreezeResponse {
  id: string;
  usedDate: string;
  remainingFreezes: number;
  currentStreak: number;
}
