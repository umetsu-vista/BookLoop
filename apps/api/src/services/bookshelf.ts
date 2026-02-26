import { eq, and, desc, asc, sql, gt, lt } from 'drizzle-orm';
import type { Database } from '../db/index';
import { userBooks, books } from '../db/schema';
import { generateId } from '../lib/id';
import { nowISO } from '../lib/date';
import { AppError } from '../lib/errors';

export class BookshelfService {
  constructor(private db: Database) {}

  async list(
    userId: string,
    options: {
      status?: string;
      sort?: string;
      order?: string;
      cursor?: string;
      limit?: number;
    },
  ) {
    const { status, sort = 'updated_at', order = 'desc', cursor, limit = 20 } = options;

    const conditions = [eq(userBooks.userId, userId)];
    if (status) {
      conditions.push(eq(userBooks.status, status));
    }
    if (cursor) {
      const op = order === 'desc' ? lt : gt;
      conditions.push(op(userBooks.updatedAt, cursor));
    }

    const orderFn = order === 'desc' ? desc : asc;
    const sortCol =
      sort === 'title'
        ? books.title
        : sort === 'author'
          ? books.author
          : sort === 'created_at'
            ? userBooks.createdAt
            : userBooks.updatedAt;

    const items = await this.db
      .select({
        id: userBooks.id,
        bookId: userBooks.bookId,
        status: userBooks.status,
        currentPage: userBooks.currentPage,
        rating: userBooks.rating,
        startedAt: userBooks.startedAt,
        finishedAt: userBooks.finishedAt,
        updatedAt: userBooks.updatedAt,
        book: {
          id: books.id,
          title: books.title,
          author: books.author,
          coverUrl: books.coverUrl,
          totalPages: books.totalPages,
          genre: books.genre,
        },
      })
      .from(userBooks)
      .innerJoin(books, eq(userBooks.bookId, books.id))
      .where(and(...conditions))
      .orderBy(orderFn(sortCol))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? resultItems[resultItems.length - 1]?.updatedAt ?? null : null;

    const [countResult] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userBooks)
      .where(
        and(eq(userBooks.userId, userId), ...(status ? [eq(userBooks.status, status)] : [])),
      );

    return {
      items: resultItems.map((item) => ({
        ...item,
        progress: item.book.totalPages
          ? Math.min(item.currentPage / item.book.totalPages, 1)
          : 0,
      })),
      nextCursor,
      totalCount: countResult?.count ?? 0,
    };
  }

  async add(userId: string, bookId: string, status = 'WANT_TO_READ') {
    const existing = await this.db
      .select()
      .from(userBooks)
      .where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError(409, 'BOOK_ALREADY_IN_SHELF', 'この書籍は既に本棚にあります');
    }

    const id = generateId();
    const now = nowISO();
    await this.db.insert(userBooks).values({
      id,
      userId,
      bookId,
      status,
      startedAt: status === 'READING' ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    return this.getDetail(userId, id);
  }

  async getDetail(userId: string, userBookId: string) {
    const result = await this.db
      .select()
      .from(userBooks)
      .innerJoin(books, eq(userBooks.bookId, books.id))
      .where(and(eq(userBooks.id, userBookId), eq(userBooks.userId, userId)))
      .limit(1);

    if (result.length === 0) {
      throw new AppError(404, 'NOT_FOUND', '本棚に指定された書籍が見つかりません');
    }

    return result[0]!;
  }

  async updateStatus(
    userId: string,
    userBookId: string,
    data: { status?: string; currentPage?: number; rating?: number },
  ) {
    const existing = await this.getDetail(userId, userBookId);
    const now = nowISO();
    const updates: Record<string, unknown> = { updatedAt: now };

    if (data.status) {
      updates.status = data.status;
      if (data.status === 'READING' && !existing.user_books.startedAt) {
        updates.startedAt = now;
      }
      if (data.status === 'FINISHED') {
        updates.finishedAt = now;
      }
    }
    if (data.currentPage !== undefined) {
      updates.currentPage = data.currentPage;
      // page_end >= total_pages → 自動的に FINISHED
      if (
        existing.books.totalPages &&
        data.currentPage >= existing.books.totalPages
      ) {
        updates.status = 'FINISHED';
        updates.finishedAt = now;
      }
    }
    if (data.rating !== undefined) {
      updates.rating = data.rating;
    }

    await this.db
      .update(userBooks)
      .set(updates)
      .where(and(eq(userBooks.id, userBookId), eq(userBooks.userId, userId)));

    return this.getDetail(userId, userBookId);
  }

  async remove(userId: string, userBookId: string) {
    const existing = await this.getDetail(userId, userBookId);
    await this.db
      .delete(userBooks)
      .where(and(eq(userBooks.id, userBookId), eq(userBooks.userId, userId)));
    return existing;
  }
}
