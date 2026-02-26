import { eq, and, desc, sql, lt } from 'drizzle-orm';
import type { Database, DbClient } from '../db/index';
import { readingSessions, sessionPauses, userBooks, dailyReadingLogs } from '../db/schema';
import { generateId } from '../lib/id';
import { nowISO, diffSeconds, getUserToday } from '../lib/date';
import { AppError } from '../lib/errors';
import type { StreakService } from './streak';
import {
  MANUAL_LOG_MAX_DAYS_AGO,
} from '@bookloop/shared';
import { subtractDays } from '@bookloop/shared';

export class SessionService {
  constructor(
    private db: Database,
    private streakService: StreakService,
  ) {}

  async start(
    userId: string,
    bookId: string,
    sessionType: string,
    timezone: string,
    externalApp?: string,
    pageStart?: number,
  ) {
    // アクティブセッション重複チェック
    const active = await this.getActive(userId);
    if (active) {
      throw new AppError(400, 'SESSION_ALREADY_ACTIVE', 'アクティブなセッションが既にあります');
    }

    const id = generateId();
    const now = nowISO();
    const localDate = getUserToday(timezone);

    await this.db.insert(readingSessions).values({
      id,
      userId,
      bookId,
      sessionType,
      externalApp: externalApp ?? null,
      startedAt: now,
      isActive: true,
      isPaused: false,
      localDate,
      pageStart: pageStart ?? null,
      createdAt: now,
    });

    return this.getById(userId, id);
  }

  async getActive(userId: string) {
    const result = await this.db
      .select()
      .from(readingSessions)
      .where(and(eq(readingSessions.userId, userId), eq(readingSessions.isActive, true)))
      .limit(1);
    return result[0] ?? null;
  }

  async getById(userId: string, sessionId: string) {
    const result = await this.db
      .select()
      .from(readingSessions)
      .where(and(eq(readingSessions.id, sessionId), eq(readingSessions.userId, userId)))
      .limit(1);

    if (result.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'セッションが見つかりません');
    }
    return result[0]!;
  }

  async pause(userId: string, sessionId: string) {
    const session = await this.getById(userId, sessionId);

    if (!session.isActive) {
      throw new AppError(400, 'SESSION_NOT_ACTIVE', 'セッションが進行中ではありません');
    }
    if (session.isPaused) {
      throw new AppError(400, 'SESSION_ALREADY_PAUSED', '既に一時停止中です');
    }

    const now = nowISO();
    const pauseId = generateId();

    await this.db.insert(sessionPauses).values({
      id: pauseId,
      sessionId,
      pausedAt: now,
      createdAt: now,
    });

    await this.db
      .update(readingSessions)
      .set({ isPaused: true })
      .where(eq(readingSessions.id, sessionId));

    const pauseCount = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(sessionPauses)
      .where(eq(sessionPauses.sessionId, sessionId));

    return {
      sessionId,
      isPaused: true,
      pausedAt: now,
      pauseCount: pauseCount[0]?.count ?? 1,
    };
  }

  async resume(userId: string, sessionId: string) {
    const session = await this.getById(userId, sessionId);

    if (!session.isPaused) {
      throw new AppError(400, 'SESSION_NOT_PAUSED', '一時停止中ではありません');
    }

    const now = nowISO();

    // 最新の未完了 pause を取得
    const [activePause] = await this.db
      .select()
      .from(sessionPauses)
      .where(and(eq(sessionPauses.sessionId, sessionId), sql`${sessionPauses.resumedAt} IS NULL`))
      .orderBy(desc(sessionPauses.pausedAt))
      .limit(1);

    if (!activePause) {
      throw new AppError(400, 'SESSION_NOT_PAUSED', '一時停止記録が見つかりません');
    }

    const pauseDurationSec = diffSeconds(activePause.pausedAt, now);

    await this.db
      .update(sessionPauses)
      .set({ resumedAt: now, durationSec: pauseDurationSec })
      .where(eq(sessionPauses.id, activePause.id));

    const newPausedTotal = session.pausedTotalSec + pauseDurationSec;
    await this.db
      .update(readingSessions)
      .set({ isPaused: false, pausedTotalSec: newPausedTotal })
      .where(eq(readingSessions.id, sessionId));

    return {
      sessionId,
      isPaused: false,
      resumedAt: now,
      pauseDurationSec,
      totalPausedSec: newPausedTotal,
    };
  }

  async end(
    userId: string,
    sessionId: string,
    timezone: string,
    data: { pageStart?: number; pageEnd?: number; memo?: string },
  ) {
    const session = await this.getById(userId, sessionId);

    if (!session.isActive) {
      throw new AppError(400, 'SESSION_NOT_ACTIVE', 'セッションが進行中ではありません');
    }

    return await this.db.transaction(async (tx) => {
      const now = nowISO();

      // 一時停止中なら自動再開（トランザクション内で直接処理）
      let pausedTotalSec = session.pausedTotalSec;
      if (session.isPaused) {
        const [activePause] = await tx
          .select()
          .from(sessionPauses)
          .where(and(eq(sessionPauses.sessionId, sessionId), sql`${sessionPauses.resumedAt} IS NULL`))
          .orderBy(desc(sessionPauses.pausedAt))
          .limit(1);

        if (activePause) {
          const pauseDurationSec = diffSeconds(activePause.pausedAt, now);
          await tx
            .update(sessionPauses)
            .set({ resumedAt: now, durationSec: pauseDurationSec })
            .where(eq(sessionPauses.id, activePause.id));
          pausedTotalSec += pauseDurationSec;
        }
      }

      const wallClockSec = diffSeconds(session.startedAt, now);
      const durationSec = Math.max(wallClockSec - pausedTotalSec, 0);

      // セッション終了
      await tx
        .update(readingSessions)
        .set({
          endedAt: now,
          durationSec,
          pausedTotalSec,
          isActive: false,
          isPaused: false,
          pageStart: data.pageStart ?? session.pageStart,
          pageEnd: data.pageEnd ?? null,
          memo: data.memo ?? session.memo,
        })
        .where(eq(readingSessions.id, sessionId));

      // user_books の current_page 更新
      if (data.pageEnd) {
        await tx
          .update(userBooks)
          .set({
            currentPage: data.pageEnd,
            updatedAt: now,
          })
          .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, session.bookId)));
      }

      // daily_reading_logs UPSERT（加算）
      await this.upsertDailyLog(userId, session.localDate, durationSec, data.pageStart, data.pageEnd, tx);

      // #9: localDate ≠ today → オフライン sync のケース → フル再計算にフォールバック
      const today = getUserToday(timezone);
      const streakResult = session.localDate !== today
        ? await this.streakService.fullRecalculate(userId, timezone, tx)
        : await this.streakService.differentialUpdate(userId, session.localDate, timezone, tx);

      return {
        session: {
          id: sessionId,
          durationSec,
          pausedTotalSec,
          wallClockSec,
          pageStart: data.pageStart ?? session.pageStart,
          pageEnd: data.pageEnd ?? null,
          sessionType: session.sessionType,
        },
        streak: streakResult,
        dailyLog: {
          totalSeconds: durationSec,
          sessionCount: 1,
        },
      };
    });
  }

  async discard(userId: string, sessionId: string, timezone: string) {
    const session = await this.getById(userId, sessionId);

    return await this.db.transaction(async (tx) => {
      // 関連する session_pauses を削除
      await tx
        .delete(sessionPauses)
        .where(eq(sessionPauses.sessionId, sessionId));

      // セッション本体を削除
      await tx
        .delete(readingSessions)
        .where(eq(readingSessions.id, sessionId));

      // daily_reading_logs を再集計
      const localDate = session.localDate;
      const remainingRows = await tx
        .select({
          total: sql<number>`COALESCE(SUM(${readingSessions.durationSec}), 0)`,
          count: sql<number>`COUNT(*)`,
          pages: sql<number>`COALESCE(SUM(
            CASE WHEN ${readingSessions.pageEnd} IS NOT NULL AND ${readingSessions.pageStart} IS NOT NULL
                 THEN ${readingSessions.pageEnd} - ${readingSessions.pageStart} ELSE 0 END
          ), 0)`,
        })
        .from(readingSessions)
        .where(
          and(
            eq(readingSessions.userId, userId),
            eq(readingSessions.localDate, localDate),
            eq(readingSessions.isActive, false),
          ),
        );

      const remaining = remainingRows[0] ?? { total: 0, count: 0, pages: 0 };
      let dailyLog: { logDate: string; totalSeconds: number; sessionCount: number } | null = null;

      if (remaining.count > 0) {
        const now = nowISO();
        await tx
          .insert(dailyReadingLogs)
          .values({
            id: generateId(),
            userId,
            logDate: localDate,
            totalSeconds: remaining.total,
            sessionCount: remaining.count,
            pagesRead: remaining.pages,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [dailyReadingLogs.userId, dailyReadingLogs.logDate],
            set: {
              totalSeconds: remaining.total,
              sessionCount: remaining.count,
              pagesRead: remaining.pages,
              updatedAt: now,
            },
          });
        dailyLog = { logDate: localDate, totalSeconds: remaining.total, sessionCount: remaining.count };
      } else {
        // その日のセッションが 0 件 → daily_log 削除
        await tx
          .delete(dailyReadingLogs)
          .where(
            and(
              eq(dailyReadingLogs.userId, userId),
              eq(dailyReadingLogs.logDate, localDate),
            ),
          );
      }

      // ストリーク再計算（セッション削除により途切れる可能性）
      const streakResult = await this.streakService.fullRecalculate(userId, timezone, tx);

      return {
        discardedSessionId: sessionId,
        dailyLog,
        streak: streakResult,
      };
    });
  }

  async createManual(
    userId: string,
    bookId: string,
    date: string,
    durationMin: number,
    timezone: string,
    data: { pageStart?: number; pageEnd?: number; memo?: string },
  ) {
    const today = getUserToday(timezone);
    const minDate = subtractDays(today, MANUAL_LOG_MAX_DAYS_AGO);
    if (date < minDate || date > today) {
      throw new AppError(400, 'MANUAL_LOG_DATE_RANGE', '記録できるのは過去7日以内です');
    }

    return await this.db.transaction(async (tx) => {
      const id = generateId();
      const now = nowISO();
      const durationSec = durationMin * 60;

      // セッション INSERT
      await tx.insert(readingSessions).values({
        id,
        userId,
        bookId,
        sessionType: 'MANUAL',
        startedAt: now,
        endedAt: now,
        durationSec,
        isActive: false,
        isPaused: false,
        localDate: date,
        pageStart: data.pageStart ?? null,
        pageEnd: data.pageEnd ?? null,
        memo: data.memo ?? null,
        createdAt: now,
      });

      // user_books の current_page 更新
      if (data.pageEnd) {
        await tx
          .update(userBooks)
          .set({ currentPage: data.pageEnd, updatedAt: now })
          .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)));
      }

      // daily_reading_logs を全セッションから再集計
      await this.rebuildDailyLog(userId, date, tx);

      // ストリーク フル再計算（過去日のため必ずフル再計算）
      const streakResult = await this.streakService.fullRecalculate(userId, timezone, tx);

      return {
        session: {
          id,
          durationSec,
          pausedTotalSec: 0,
          wallClockSec: durationSec,
          pageStart: data.pageStart ?? null,
          pageEnd: data.pageEnd ?? null,
          sessionType: 'MANUAL',
        },
        streak: streakResult,
        dailyLog: { totalSeconds: durationSec, sessionCount: 1 },
      };
    });
  }

  async list(
    userId: string,
    options: { bookId?: string; cursor?: string; limit?: number },
  ) {
    const { bookId, cursor, limit = 20 } = options;

    const conditions = [eq(readingSessions.userId, userId), eq(readingSessions.isActive, false)];
    if (bookId) conditions.push(eq(readingSessions.bookId, bookId));
    if (cursor) conditions.push(lt(readingSessions.createdAt, cursor));

    const items = await this.db
      .select()
      .from(readingSessions)
      .where(and(...conditions))
      .orderBy(desc(readingSessions.createdAt))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? resultItems[resultItems.length - 1]?.createdAt ?? null : null;

    return { items: resultItems, nextCursor, totalCount: resultItems.length };
  }

  async update(userId: string, sessionId: string, data: { memo?: string }) {
    await this.getById(userId, sessionId);
    await this.db
      .update(readingSessions)
      .set({ memo: data.memo })
      .where(and(eq(readingSessions.id, sessionId), eq(readingSessions.userId, userId)));
    return this.getById(userId, sessionId);
  }

  private async upsertDailyLog(
    userId: string,
    date: string,
    durationSec: number,
    pageStart?: number,
    pageEnd?: number,
    dbOrTx?: DbClient,
  ) {
    const db = dbOrTx ?? this.db;
    const pagesRead =
      pageStart !== undefined && pageEnd !== undefined ? Math.max(pageEnd - pageStart, 0) : 0;
    const now = nowISO();

    await db
      .insert(dailyReadingLogs)
      .values({
        id: generateId(),
        userId,
        logDate: date,
        totalSeconds: durationSec,
        sessionCount: 1,
        pagesRead,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [dailyReadingLogs.userId, dailyReadingLogs.logDate],
        set: {
          totalSeconds: sql`${dailyReadingLogs.totalSeconds} + ${durationSec}`,
          sessionCount: sql`${dailyReadingLogs.sessionCount} + 1`,
          pagesRead: sql`${dailyReadingLogs.pagesRead} + ${pagesRead}`,
          updatedAt: now,
        },
      });
  }

  private async rebuildDailyLog(userId: string, date: string, dbOrTx?: DbClient) {
    const db = dbOrTx ?? this.db;
    const [aggregate] = await db
      .select({
        totalSec: sql<number>`COALESCE(SUM(${readingSessions.durationSec}), 0)`,
        count: sql<number>`COUNT(*)`,
        pages: sql<number>`COALESCE(SUM(
          CASE WHEN ${readingSessions.pageEnd} IS NOT NULL AND ${readingSessions.pageStart} IS NOT NULL
               THEN ${readingSessions.pageEnd} - ${readingSessions.pageStart} ELSE 0 END
        ), 0)`,
      })
      .from(readingSessions)
      .where(
        and(
          eq(readingSessions.userId, userId),
          eq(readingSessions.localDate, date),
          eq(readingSessions.isActive, false),
        ),
      );

    const now = nowISO();
    await db
      .insert(dailyReadingLogs)
      .values({
        id: generateId(),
        userId,
        logDate: date,
        totalSeconds: aggregate?.totalSec ?? 0,
        sessionCount: aggregate?.count ?? 0,
        pagesRead: aggregate?.pages ?? 0,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [dailyReadingLogs.userId, dailyReadingLogs.logDate],
        set: {
          totalSeconds: aggregate?.totalSec ?? 0,
          sessionCount: aggregate?.count ?? 0,
          pagesRead: aggregate?.pages ?? 0,
          updatedAt: now,
        },
      });
  }
}
