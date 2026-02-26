import { Hono } from 'hono';
import { calendarQuerySchema } from '@bookloop/shared';
import type { Services } from '../services/factory';

type Env = {
  Variables: {
    requestContext: { userId: string; timezone: string };
    services: Services;
  };
};

const streakRoutes = new Hono<Env>();

// GET /streaks
streakRoutes.get('/', async (c) => {
  const { userId, timezone } = c.var.requestContext;
  const result = await c.var.services.streak.get(userId, timezone);
  return c.json({ data: result });
});

// GET /streaks/calendar
streakRoutes.get('/calendar', async (c) => {
  const { userId } = c.var.requestContext;
  const query = calendarQuerySchema.parse({
    year: c.req.query('year'),
    month: c.req.query('month'),
  });
  const result = await c.var.services.streak.getCalendar(userId, query.year, query.month);
  return c.json({ data: result });
});

// POST /streaks/freeze
streakRoutes.post('/freeze', async (c) => {
  const { userId, timezone } = c.var.requestContext;
  const result = await c.var.services.streak.freeze(userId, timezone);
  return c.json({ data: result });
});

export { streakRoutes };
