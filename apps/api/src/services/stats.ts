import { eq, and, gte, sql } from 'drizzle-orm';
import type { Database } from '../db/index';
import { dailyReadingLogs, streaks, userBooks } from '../db/schema';
import { getUserToday } from '../lib/date';
import { getWeekRange } from '@bookloop/shared';

export class StatsService {
  constructor(private db: Database) {}

  async getSummary(userId: string) {
    const [totals, finishedCount, streak] = await Promise.all([
      this.db
        .select({
          totalSeconds: sql<number>`COALESCE(SUM(${dailyReadingLogs.totalSeconds}), 0)`,
          totalSessions: sql<number>`COALESCE(SUM(${dailyReadingLogs.sessionCount}), 0)`,
          totalPages: sql<number>`COALESCE(SUM(${dailyReadingLogs.pagesRead}), 0)`,
        })
        .from(dailyReadingLogs)
        .where(eq(dailyReadingLogs.userId, userId))
        .then((r) => r[0]),

      this.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userBooks)
        .where(and(eq(userBooks.userId, userId), eq(userBooks.status, 'FINISHED')))
        .then((r) => r[0]),

      this.db
        .select()
        .from(streaks)
        .where(eq(streaks.userId, userId))
        .limit(1)
        .then((r) => r[0]),
    ]);

    const totalSessions = totals?.totalSessions ?? 0;
    const totalSeconds = totals?.totalSeconds ?? 0;

    return {
      totalSeconds,
      totalSessions,
      totalPages: totals?.totalPages ?? 0,
      booksFinished: finishedCount?.count ?? 0,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      averageSessionSec: totalSessions > 0 ? Math.round(totalSeconds / totalSessions) : 0,
    };
  }

  async getWeekly(userId: string, timezone: string, date?: string) {
    const targetDate = date ?? getUserToday(timezone);
    const { start, end } = getWeekRange(targetDate);

    const logs = await this.db
      .select()
      .from(dailyReadingLogs)
      .where(
        and(
          eq(dailyReadingLogs.userId, userId),
          gte(dailyReadingLogs.logDate, start),
          sql`${dailyReadingLogs.logDate} <= ${end}`,
        ),
      )
      .orderBy(dailyReadingLogs.logDate);

    const totalSeconds = logs.reduce((sum, l) => sum + l.totalSeconds, 0);
    const totalSessions = logs.reduce((sum, l) => sum + l.sessionCount, 0);
    const totalPages = logs.reduce((sum, l) => sum + l.pagesRead, 0);

    return {
      weekStart: start,
      weekEnd: end,
      totalSeconds,
      totalSessions,
      totalPages,
      dailyBreakdown: logs.map((l) => ({
        date: l.logDate,
        totalSeconds: l.totalSeconds,
        sessionCount: l.sessionCount,
        pagesRead: l.pagesRead,
      })),
    };
  }

  async getMonthly(userId: string, year: number, month: number) {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const startDate = `${monthStr}-01`;
    const nextMonth =
      month === 12
        ? `${year + 1}-01`
        : `${year}-${String(month + 1).padStart(2, '0')}`;
    const endDate = `${nextMonth}-01`;

    const logs = await this.db
      .select()
      .from(dailyReadingLogs)
      .where(
        and(
          eq(dailyReadingLogs.userId, userId),
          gte(dailyReadingLogs.logDate, startDate),
          sql`${dailyReadingLogs.logDate} < ${endDate}`,
        ),
      )
      .orderBy(dailyReadingLogs.logDate);

    const totalSeconds = logs.reduce((sum, l) => sum + l.totalSeconds, 0);
    const totalSessions = logs.reduce((sum, l) => sum + l.sessionCount, 0);
    const totalPages = logs.reduce((sum, l) => sum + l.pagesRead, 0);

    // この月に読了した冊数
    const [finishedCount] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userBooks)
      .where(
        and(
          eq(userBooks.userId, userId),
          eq(userBooks.status, 'FINISHED'),
          gte(userBooks.finishedAt, startDate),
          sql`${userBooks.finishedAt} < ${endDate}`,
        ),
      );

    return {
      year,
      month,
      totalSeconds,
      totalSessions,
      totalPages,
      booksFinished: finishedCount?.count ?? 0,
      dailyBreakdown: logs.map((l) => ({
        date: l.logDate,
        totalSeconds: l.totalSeconds,
        sessionCount: l.sessionCount,
        pagesRead: l.pagesRead,
      })),
    };
  }
}
