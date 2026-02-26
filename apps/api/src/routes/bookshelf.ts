import { Hono } from 'hono';
import {
  addToBookshelfSchema,
  updateBookshelfSchema,
  bookshelfQuerySchema,
} from '@bookloop/shared';
import type { Services } from '../services/factory';

type Env = {
  Variables: {
    requestContext: { userId: string; timezone: string };
    services: Services;
  };
};

const bookshelfRoutes = new Hono<Env>();

// GET /bookshelf
bookshelfRoutes.get('/', async (c) => {
  const { userId } = c.var.requestContext;
  const query = bookshelfQuerySchema.parse({
    status: c.req.query('status'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    cursor: c.req.query('cursor'),
    limit: c.req.query('limit'),
  });

  const result = await c.var.services.bookshelf.list(userId, query);
  return c.json(result);
});

// POST /bookshelf
bookshelfRoutes.post('/', async (c) => {
  const { userId } = c.var.requestContext;
  const body = await c.req.json();
  const data = addToBookshelfSchema.parse(body);
  const result = await c.var.services.bookshelf.add(userId, data.bookId, data.status);
  return c.json({ data: result }, 201);
});

// GET /bookshelf/:userBookId
bookshelfRoutes.get('/:userBookId', async (c) => {
  const { userId } = c.var.requestContext;
  const userBookId = c.req.param('userBookId');
  const result = await c.var.services.bookshelf.getDetail(userId, userBookId);
  return c.json({ data: result });
});

// PATCH /bookshelf/:userBookId
bookshelfRoutes.patch('/:userBookId', async (c) => {
  const { userId } = c.var.requestContext;
  const userBookId = c.req.param('userBookId');
  const body = await c.req.json();
  const data = updateBookshelfSchema.parse(body);
  const result = await c.var.services.bookshelf.updateStatus(userId, userBookId, data);
  return c.json({ data: result });
});

// DELETE /bookshelf/:userBookId
bookshelfRoutes.delete('/:userBookId', async (c) => {
  const { userId } = c.var.requestContext;
  const userBookId = c.req.param('userBookId');
  await c.var.services.bookshelf.remove(userId, userBookId);
  return c.json({ data: { deleted: true } });
});

export { bookshelfRoutes };
