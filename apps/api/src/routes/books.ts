import { Hono } from 'hono';
import { searchBooksSchema, createManualBookSchema } from '@bookloop/shared';
import type { Services } from '../services/factory';

type Env = {
  Variables: {
    requestContext: { userId: string; timezone: string };
    services: Services;
  };
  Bindings: {
    RAKUTEN_APP_ID?: string;
    RAKUTEN_ACCESS_KEY?: string;
  };
};

const bookRoutes = new Hono<Env>();

// GET /books/search
bookRoutes.get('/search', async (c) => {
  const query = searchBooksSchema.parse({
    q: c.req.query('q'),
    type: c.req.query('type'),
  });

  const results = await c.var.services.book.search(
    query.q,
    query.type,
    c.env.RAKUTEN_APP_ID,
    c.env.RAKUTEN_ACCESS_KEY,
  );

  return c.json({ data: results });
});

// GET /books/:bookId
bookRoutes.get('/:bookId', async (c) => {
  const bookId = c.req.param('bookId');
  const { dataPromise, refreshPromise } = c.var.services.book.getByIdWithCacheCheck(bookId);
  const book = await dataPromise;
  if (!book) {
    return c.json({ error: { code: 'NOT_FOUND', message: '書籍が見つかりません' } }, 404);
  }
  // キャッシュリフレッシュが必要な場合、レスポンスをブロックせずバックグラウンド実行
  if (refreshPromise) {
    c.executionCtx.waitUntil(refreshPromise);
  }
  return c.json({ data: book });
});

// POST /books
bookRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const data = createManualBookSchema.parse(body);
  const book = await c.var.services.book.createManual(data.title, data.author, data.totalPages);
  return c.json({ data: book }, 201);
});

export { bookRoutes };
