import { Hono } from 'hono';
import {
  createSessionSchema,
  endSessionSchema,
  createManualSessionSchema,
  sessionListQuerySchema,
  updateSessionSchema,
} from '@bookloop/shared';
import type { Services } from '../services/factory';

type Env = {
  Variables: {
    requestContext: { userId: string; timezone: string };
    services: Services;
  };
};

const sessionRoutes = new Hono<Env>();

// POST /sessions
sessionRoutes.post('/', async (c) => {
  const { userId, timezone } = c.var.requestContext;
  const body = await c.req.json();
  const data = createSessionSchema.parse(body);
  const result = await c.var.services.session.start(
    userId,
    data.bookId,
    data.sessionType,
    timezone,
    data.externalApp,
    data.pageStart,
  );
  return c.json({ data: result }, 201);
});

// GET /sessions/active
sessionRoutes.get('/active', async (c) => {
  const { userId } = c.var.requestContext;
  const result = await c.var.services.session.getActive(userId);
  return c.json({ data: result });
});

// GET /sessions
sessionRoutes.get('/', async (c) => {
  const { userId } = c.var.requestContext;
  const query = sessionListQuerySchema.parse({
    bookId: c.req.query('bookId'),
    cursor: c.req.query('cursor'),
    limit: c.req.query('limit'),
  });
  const result = await c.var.services.session.list(userId, query);
  return c.json(result);
});

// PATCH /sessions/:sessionId
sessionRoutes.patch('/:sessionId', async (c) => {
  const { userId } = c.var.requestContext;
  const sessionId = c.req.param('sessionId');
  const body = await c.req.json();
  const data = updateSessionSchema.parse(body);
  const result = await c.var.services.session.update(userId, sessionId, data);
  return c.json({ data: result });
});

// POST /sessions/:sessionId/pause
sessionRoutes.post('/:sessionId/pause', async (c) => {
  const { userId } = c.var.requestContext;
  const sessionId = c.req.param('sessionId');
  const result = await c.var.services.session.pause(userId, sessionId);
  return c.json({ data: result });
});

// POST /sessions/:sessionId/resume
sessionRoutes.post('/:sessionId/resume', async (c) => {
  const { userId } = c.var.requestContext;
  const sessionId = c.req.param('sessionId');
  const result = await c.var.services.session.resume(userId, sessionId);
  return c.json({ data: result });
});

// POST /sessions/:sessionId/end
sessionRoutes.post('/:sessionId/end', async (c) => {
  const { userId, timezone } = c.var.requestContext;
  const sessionId = c.req.param('sessionId');
  const body = await c.req.json();
  const data = endSessionSchema.parse(body);
  const result = await c.var.services.session.end(userId, sessionId, timezone, data);
  return c.json({ data: result });
});

// DELETE /sessions/:sessionId
sessionRoutes.delete('/:sessionId', async (c) => {
  const { userId, timezone } = c.var.requestContext;
  const sessionId = c.req.param('sessionId');
  const result = await c.var.services.session.discard(userId, sessionId, timezone);
  return c.json({ data: result });
});

// POST /sessions/manual
sessionRoutes.post('/manual', async (c) => {
  const { userId, timezone } = c.var.requestContext;
  const body = await c.req.json();
  const data = createManualSessionSchema.parse(body);
  const result = await c.var.services.session.createManual(
    userId,
    data.bookId,
    data.date,
    data.durationMin,
    timezone,
    { pageStart: data.pageStart, pageEnd: data.pageEnd, memo: data.memo },
  );
  return c.json({ data: result }, 201);
});

export { sessionRoutes };
