import { eq, and, or, like, sql } from 'drizzle-orm';
import type { Database } from '../db/index';
import { books } from '../db/schema';
import { generateId } from '../lib/id';
import { nowISO } from '../lib/date';
import { AppError } from '../lib/errors';
import { BOOK_CACHE_REFRESH_DAYS } from '@bookloop/shared';

interface ExternalBookResult {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  isbn: string | null;
  totalPages: number | null;
  coverUrl: string | null;
  description: string | null;
  publishedAt: string | null;
}

export class BookService {
  constructor(private db: Database) {}

  async search(query: string, type: 'isbn' | 'keyword', rakutenAppId?: string, rakutenAccessKey?: string) {
    // DB キャッシュ検索
    const cached = await this.searchCache(query, type);
    if (cached.length > 0) return cached;

    // 楽天ブックスAPI（キーワード検索）
    if (type === 'keyword' && rakutenAppId && rakutenAccessKey) {
      const external = await this.fetchRakutenBooks(query, rakutenAppId, rakutenAccessKey);
      if (external.length > 0) {
        await this.upsertExternalBooks(external, 'RAKUTEN_BOOKS');
        return this.searchCache(query, type);
      }
    }

    // OpenBD フォールバック（ISBN のみ）
    if (type === 'isbn') {
      const openbd = await this.fetchOpenBD(query);
      if (openbd) {
        await this.upsertExternalBooks([openbd], 'OPENBD');
        return this.searchCache(query, type);
      }
    }

    return [];
  }

  async getById(bookId: string) {
    const result = await this.db.select().from(books).where(eq(books.id, bookId)).limit(1);
    return result[0] ?? null;
  }

  /**
   * 書籍取得 + キャッシュリフレッシュ判定。
   * fetchedAt が BOOK_CACHE_REFRESH_DAYS 超過の場合、リフレッシュ用 Promise を返す。
   */
  getByIdWithCacheCheck(bookId: string): {
    dataPromise: Promise<typeof books.$inferSelect | null>;
    refreshPromise: Promise<void> | null;
  } {
    let refreshPromise: Promise<void> | null = null;

    const dataPromise = this.db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1)
      .then((result) => {
        const book = result[0] ?? null;
        if (book?.isbn && book.fetchedAt) {
          const daysSinceFetch =
            (Date.now() - new Date(book.fetchedAt).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceFetch > BOOK_CACHE_REFRESH_DAYS) {
            refreshPromise = this.refreshBookCache(book.isbn, book.id);
          }
        }
        return book;
      });

    return { dataPromise, get refreshPromise() { return refreshPromise; } };
  }

  private async refreshBookCache(isbn: string, bookId: string): Promise<void> {
    try {
      const fresh = await this.fetchOpenBD(isbn);
      if (!fresh) return;

      await this.db
        .update(books)
        .set({
          title: fresh.title,
          author: fresh.author,
          coverUrl: fresh.coverUrl,
          description: fresh.description,
          fetchedAt: nowISO(),
        })
        .where(eq(books.id, bookId));
    } catch {
      // リフレッシュ失敗は無視（既存データを維持）
    }
  }

  async createManual(title: string, author?: string, totalPages?: number) {
    const duplicate = await this.checkDuplicateManual(title, author ?? null);
    if (duplicate) {
      throw new AppError(409, 'DUPLICATE_BOOK_CANDIDATE', '類似の書籍が既に登録されています');
    }

    const id = generateId();
    const now = nowISO();
    await this.db.insert(books).values({
      id,
      title: title.trim(),
      author: author?.trim() ?? null,
      totalPages: totalPages ?? null,
      source: 'MANUAL',
      genre: 'OTHER',
      createdAt: now,
    });

    return this.getById(id);
  }

  private async checkDuplicateManual(title: string, author: string | null) {
    const normalized = title.trim().toLowerCase();
    const conditions = [eq(sql`LOWER(${books.title})`, normalized), eq(books.source, 'MANUAL')];

    if (author) {
      conditions.push(eq(sql`LOWER(${books.author})`, author.trim().toLowerCase()));
    }

    const result = await this.db
      .select()
      .from(books)
      .where(and(...conditions))
      .limit(1);

    return result[0] ?? null;
  }

  private async searchCache(query: string, type: 'isbn' | 'keyword') {
    if (type === 'isbn') {
      return this.db.select().from(books).where(eq(books.isbn, query)).limit(1);
    }
    return this.db
      .select()
      .from(books)
      .where(or(like(books.title, `%${query}%`), like(books.author, `%${query}%`)))
      .limit(20);
  }

  private async upsertExternalBooks(externalBooks: ExternalBookResult[], source: string) {
    for (const book of externalBooks) {
      if (!book.isbn) continue;
      const existing = await this.db
        .select()
        .from(books)
        .where(eq(books.isbn, book.isbn))
        .limit(1);

      if (existing.length === 0) {
        await this.db.insert(books).values({
          id: generateId(),
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          coverUrl: book.coverUrl,
          totalPages: book.totalPages,
          description: book.description,
          publishedAt: book.publishedAt,
          source,
          genre: 'OTHER',
          fetchedAt: nowISO(),
          createdAt: nowISO(),
        });
      }
    }
  }

  private async fetchRakutenBooks(
    query: string,
    appId: string,
    accessKey: string,
  ): Promise<ExternalBookResult[]> {
    const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404');
    url.searchParams.set('applicationId', appId);
    url.searchParams.set('accessKey', accessKey);
    url.searchParams.set('title', query);
    url.searchParams.set('hits', '30');
    url.searchParams.set('sort', 'standard');
    url.searchParams.set('format', 'json');

    try {
      const res = await fetch(url.toString(), {
        headers: {
          Referer: 'http://localhost',
          Origin: 'http://localhost',
        },
      });
      if (!res.ok) return [];

      const data = (await res.json()) as {
        Items?: Array<{
          Item: {
            title: string;
            subTitle: string;
            author: string;
            publisherName: string;
            isbn: string;
            largeImageUrl: string;
            mediumImageUrl: string;
            smallImageUrl: string;
            itemCaption: string;
            salesDate: string;
          };
        }>;
      };

      if (!data.Items) return [];

      return data.Items.map(({ Item: item }) => {
        let title = item.title;
        if (item.subTitle) {
          title = `${item.title} ${item.subTitle}`;
        }

        return {
          id: generateId(),
          title,
          author: item.author || null,
          publisher: item.publisherName || null,
          isbn: item.isbn || null,
          totalPages: null,
          coverUrl: item.largeImageUrl || item.mediumImageUrl || item.smallImageUrl || null,
          description: item.itemCaption || null,
          publishedAt: item.salesDate || null,
        };
      });
    } catch {
      return [];
    }
  }

  private async fetchOpenBD(isbn: string): Promise<ExternalBookResult | null> {
    try {
      const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
      if (!res.ok) return null;
      const data = (await res.json()) as Array<{
        summary?: {
          title: string;
          author: string;
          publisher: string;
          isbn: string;
          cover: string;
        };
        onix?: {
          DescriptiveDetail?: {
            Extent?: Array<{ ExtentValue: string }>;
          };
          CollateralDetail?: {
            TextContent?: Array<{ Text: string }>;
          };
        };
      } | null>;

      const book = data[0];
      if (!book?.summary) return null;

      const pages = book.onix?.DescriptiveDetail?.Extent?.[0]?.ExtentValue;
      const description = book.onix?.CollateralDetail?.TextContent?.[0]?.Text;

      return {
        id: generateId(),
        title: book.summary.title,
        author: book.summary.author || null,
        publisher: book.summary.publisher || null,
        isbn: book.summary.isbn,
        totalPages: pages ? parseInt(pages, 10) : null,
        coverUrl: book.summary.cover || null,
        description: description ?? null,
        publishedAt: null,
      };
    } catch {
      return null;
    }
  }
}
