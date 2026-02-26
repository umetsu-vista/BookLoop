export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  updatedAt: string;
}

export interface StreakFreeze {
  id: string;
  userId: string;
  usedDate: string;
  month: string;
  activatedAt: string;
  createdAt: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  freezesUsedThisMonth: number;
  freezesRemaining: number;
  hasReadToday: boolean;
}

export interface CalendarDay {
  date: string;
  totalSeconds: number;
  sessionCount: number;
  hasFrozen: boolean;
}

export interface CalendarQuery {
  year: number;
  month: number;
}
