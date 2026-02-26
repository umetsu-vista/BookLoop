import { eq, and, desc, lt } from 'drizzle-orm';
import type { Database } from '../db/index';
import { readingNotes } from '../db/schema';
import { generateId } from '../lib/id';
import { nowISO } from '../lib/date';
import { AppError } from '../lib/errors';

export class NoteService {
  constructor(private db: Database) {}

  async list(
    userId: string,
    options: { bookId?: string; cursor?: string; limit?: number },
  ) {
    const { bookId, cursor, limit = 20 } = options;

    const conditions = [eq(readingNotes.userId, userId)];
    if (bookId) conditions.push(eq(readingNotes.bookId, bookId));
    if (cursor) conditions.push(lt(readingNotes.createdAt, cursor));

    const items = await this.db
      .select()
      .from(readingNotes)
      .where(and(...conditions))
      .orderBy(desc(readingNotes.createdAt))
      .limit(limit + 1);

    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? resultItems[resultItems.length - 1]?.createdAt ?? null : null;

    return { items: resultItems, nextCursor, totalCount: resultItems.length };
  }

  async create(
    userId: string,
    bookId: string,
    content: string,
    sessionId?: string,
    pageNumber?: number,
  ) {
    const id = generateId();
    const now = nowISO();

    await this.db.insert(readingNotes).values({
      id,
      userId,
      bookId,
      sessionId: sessionId ?? null,
      content,
      pageNumber: pageNumber ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return this.getById(userId, id);
  }

  async update(userId: string, noteId: string, data: { content?: string; pageNumber?: number }) {
    await this.getById(userId, noteId);

    const updates: Record<string, unknown> = { updatedAt: nowISO() };
    if (data.content !== undefined) updates.content = data.content;
    if (data.pageNumber !== undefined) updates.pageNumber = data.pageNumber;

    await this.db
      .update(readingNotes)
      .set(updates)
      .where(and(eq(readingNotes.id, noteId), eq(readingNotes.userId, userId)));

    return this.getById(userId, noteId);
  }

  async delete(userId: string, noteId: string) {
    await this.getById(userId, noteId);
    await this.db
      .delete(readingNotes)
      .where(and(eq(readingNotes.id, noteId), eq(readingNotes.userId, userId)));
  }

  private async getById(userId: string, noteId: string) {
    const [note] = await this.db
      .select()
      .from(readingNotes)
      .where(and(eq(readingNotes.id, noteId), eq(readingNotes.userId, userId)))
      .limit(1);

    if (!note) {
      throw new AppError(404, 'NOT_FOUND', 'メモが見つかりません');
    }
    return note;
  }
}
