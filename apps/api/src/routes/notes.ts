import { Hono } from 'hono';
import { createNoteSchema, updateNoteSchema, noteListQuerySchema } from '@bookloop/shared';
import type { Services } from '../services/factory';

type Env = {
  Variables: {
    requestContext: { userId: string; timezone: string };
    services: Services;
  };
};

const noteRoutes = new Hono<Env>();

// GET /notes
noteRoutes.get('/', async (c) => {
  const { userId } = c.var.requestContext;
  const query = noteListQuerySchema.parse({
    bookId: c.req.query('bookId'),
    cursor: c.req.query('cursor'),
    limit: c.req.query('limit'),
  });
  const result = await c.var.services.note.list(userId, query);
  return c.json(result);
});

// POST /notes
noteRoutes.post('/', async (c) => {
  const { userId } = c.var.requestContext;
  const body = await c.req.json();
  const data = createNoteSchema.parse(body);
  const result = await c.var.services.note.create(
    userId,
    data.bookId,
    data.content,
    data.sessionId,
    data.pageNumber,
  );
  return c.json({ data: result }, 201);
});

// PATCH /notes/:noteId
noteRoutes.patch('/:noteId', async (c) => {
  const { userId } = c.var.requestContext;
  const noteId = c.req.param('noteId');
  const body = await c.req.json();
  const data = updateNoteSchema.parse(body);
  const result = await c.var.services.note.update(userId, noteId, data);
  return c.json({ data: result });
});

// DELETE /notes/:noteId
noteRoutes.delete('/:noteId', async (c) => {
  const { userId } = c.var.requestContext;
  const noteId = c.req.param('noteId');
  await c.var.services.note.delete(userId, noteId);
  return c.json({ data: { deleted: true } });
});

export { noteRoutes };
