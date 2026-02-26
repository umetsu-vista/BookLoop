import { eq, and, desc, gte, gt, sql } from 'drizzle-orm';
import type { Database, DbClient } from '../db/index';
import { streaks, streakFreezes, dailyReadingLogs } from '../db/schema';
import { generateId } from '../lib/id';
import { nowISO, getUserToday } from '../lib/date';
import { AppError } from '../lib/errors';
import {
  subtractDays,
  daysBetween,
  getDatesBetween,
  getMonthString,
  STREAK_FREEZE_MAX_PER_MONTH,
} from '@bookloop/shared';

export class StreakService {
  constructor(private db: Database) {}

  async get(userId: string, timezone: string) {
    const streak = await this.getOrCreate(userId);
    const today = getUserToday(timezone);
    const monthStr = today.substring(0, 7);

    const [freezeCount] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(streakFreezes)
      .where(and(eq(streakFreezes.userId, userId), eq(streakFreezes.month, monthStr)));

    const [todayLog] = await this.db
      .select()
      .from(dailyReadingLogs)
      .where(
        and(
          eq(dailyReadingLogs.userId, userId),
          eq(dailyReadingLogs.logDate, today),
          gt(dailyReadingLogs.sessionCount, 0),
        ),
      )
      .limit(1);

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
      freezesUsedThisMonth: freezeCount?.count ?? 0,
      freezesRemaining: STREAK_FREEZE_MAX_PER_MONTH - (freezeCount?.count ?? 0),
      hasReadToday: !!todayLog,
    };
  }

  async differentialUpdate(userId: string, localDate: string, _timezone: string, tx?: DbClient) {
    const db = tx ?? this.db;
    const streak = await this.getOrCreate(userId, db);

    let currentStreak = streak.currentStreak;
    let longestStreak = streak.longestStreak;
    let isNewRecord = false;

    if (streak.lastActiveDate === localDate) {
      // 同日 → 変更なし
    } else if (
      streak.lastActiveDate &&
      daysBetween(streak.lastActiveDate, localDate) === 1
    ) {
      // 連続
      currentStreak += 1;
    } else if (streak.lastActiveDate) {
      // 間の日を確認
      const gapDates = getDatesBetween(streak.lastActiveDate, localDate);
      const freezeDates = await this.getFreezeDates(userId, db);
      const freezeSet = new Set(freezeDates);

      const allCovered = gapDates.every((d) => freezeSet.has(d));
      if (allCovered) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    } else {
      // 初回
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
      isNewRecord = true;
    }

    await db
      .update(streaks)
      .set({
        currentStreak,
        longestStreak,
        lastActiveDate: localDate,
        updatedAt: nowISO(),
      })
      .where(eq(streaks.userId, userId));

    return { currentStreak, longestStreak, isNewRecord };
  }

  async fullRecalculate(userId: string, timezone: string, tx?: DbClient) {
    const db = tx ?? this.db;
    const today = getUserToday(timezone);

    // 過去365日分の daily_reading_logs
    const logs = await db
      .select({ logDate: dailyReadingLogs.logDate })
      .from(dailyReadingLogs)
      .where(
        and(
          eq(dailyReadingLogs.userId, userId),
          gte(dailyReadingLogs.logDate, subtractDays(today, 365)),
          gt(dailyReadingLogs.sessionCount, 0),
        ),
      )
      .orderBy(desc(dailyReadingLogs.logDate));

    const freezeDates = await this.getFreezeDates(userId, db);
    const logSet = new Set(logs.map((l) => l.logDate));
    const freezeSet = new Set(freezeDates);

    // today から遡って連続日数をカウント
    let currentStreak = 0;
    let currentDate = today;

    while (true) {
      const hasLog = logSet.has(currentDate);
      const hasFreeze = freezeSet.has(currentDate);

      if (hasLog) {
        currentStreak++;
        currentDate = subtractDays(currentDate, 1);
      } else if (hasFreeze) {
        currentDate = subtractDays(currentDate, 1);
      } else {
        break;
      }
    }

    const existing = await this.getOrCreate(userId, db);
    const longestStreak = Math.max(currentStreak, existing.longestStreak);
    const isNewRecord = currentStreak > existing.longestStreak;

    const lastActive = logs[0]?.logDate ?? null;

    await db
      .update(streaks)
      .set({
        currentStreak,
        longestStreak,
        lastActiveDate: lastActive,
        updatedAt: nowISO(),
      })
      .where(eq(streaks.userId, userId));

    return { currentStreak, longestStreak, isNewRecord };
  }

  async freeze(userId: string, timezone: string) {
    const today = getUserToday(timezone);
    const monthStr = today.substring(0, 7);

    // 当日セッション済みならフリーズ不要
    const [todayLog] = await this.db
      .select()
      .from(dailyReadingLogs)
      .where(
        and(
          eq(dailyReadingLogs.userId, userId),
          eq(dailyReadingLogs.logDate, today),
          gt(dailyReadingLogs.sessionCount, 0),
        ),
      )
      .limit(1);

    if (todayLog) {
      throw new AppError(400, 'FREEZE_NOT_NEEDED', '今日は既に読書しています。フリーズは不要です');
    }

    // 月上限チェック
    const [freezeCount] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(streakFreezes)
      .where(and(eq(streakFreezes.userId, userId), eq(streakFreezes.month, monthStr)));

    if ((freezeCount?.count ?? 0) >= STREAK_FREEZE_MAX_PER_MONTH) {
      throw new AppError(400, 'FREEZE_LIMIT_REACHED', '今月のフリーズ上限（2回）に達しています');
    }

    // 当日既にフリーズ済みか
    const [existingFreeze] = await this.db
      .select()
      .from(streakFreezes)
      .where(and(eq(streakFreezes.userId, userId), eq(streakFreezes.usedDate, today)))
      .limit(1);

    if (existingFreeze) {
      throw new AppError(400, 'FREEZE_LIMIT_REACHED', '今日は既にフリーズを使用しています');
    }

    const id = generateId();
    const now = nowISO();
    await this.db.insert(streakFreezes).values({
      id,
      userId,
      usedDate: today,
      month: monthStr,
      activatedAt: now,
      createdAt: now,
    });

    return {
      usedDate: today,
      freezesRemaining: STREAK_FREEZE_MAX_PER_MONTH - ((freezeCount?.count ?? 0) + 1),
    };
  }

  async getCalendar(userId: string, year: number, month: number) {
    const monthStr = getMonthString(year, month);
    const startDate = `${monthStr}-01`;
    const nextMonth = month === 12 ? `${year + 1}-01` : getMonthString(year, month + 1);
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
      );

    const freezes = await this.db
      .select()
      .from(streakFreezes)
      .where(and(eq(streakFreezes.userId, userId), eq(streakFreezes.month, monthStr)));

    const freezeSet = new Set(freezes.map((f) => f.usedDate));

    return logs.map((log) => ({
      date: log.logDate,
      totalSeconds: log.totalSeconds,
      sessionCount: log.sessionCount,
      hasFrozen: freezeSet.has(log.logDate),
    }));
  }

  private async getOrCreate(userId: string, dbOrTx?: DbClient) {
    const db = dbOrTx ?? this.db;
    const [existing] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId))
      .limit(1);

    if (existing) return existing;

    const id = generateId();
    await db.insert(streaks).values({
      id,
      userId,
      currentStreak: 0,
      longestStreak: 0,
      updatedAt: nowISO(),
    });

    const [created] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId))
      .limit(1);

    return created!;
  }

  private async getFreezeDates(userId: string, dbOrTx?: DbClient): Promise<string[]> {
    const db = dbOrTx ?? this.db;
    const freezes = await db
      .select({ usedDate: streakFreezes.usedDate })
      .from(streakFreezes)
      .where(eq(streakFreezes.userId, userId));
    return freezes.map((f) => f.usedDate);
  }
}
