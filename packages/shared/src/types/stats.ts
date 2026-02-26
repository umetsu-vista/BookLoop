export interface DailyReadingLog {
  id: string;
  userId: string;
  logDate: string;
  totalSeconds: number;
  sessionCount: number;
  pagesRead: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatsSummary {
  totalSeconds: number;
  totalSessions: number;
  totalPages: number;
  booksFinished: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionSec: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalSeconds: number;
  totalSessions: number;
  totalPages: number;
  dailyBreakdown: DayStats[];
}

export interface MonthlyStats {
  year: number;
  month: number;
  totalSeconds: number;
  totalSessions: number;
  totalPages: number;
  booksFinished: number;
  dailyBreakdown: DayStats[];
}

export interface DayStats {
  date: string;
  totalSeconds: number;
  sessionCount: number;
  pagesRead: number;
}
