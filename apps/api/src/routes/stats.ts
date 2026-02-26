import { Hono } from 'hono';
import { weeklyQuerySchema, monthlyQuerySchema } from '@bookloop/shared';
import type { Services } from '../services/factory';

type Env = {
  Variables: {
    requestContext: { userId: string; timezone: string };
    services: Services;
  };
};

const statsRoutes = new Hono<Env>();

// GET /stats/summary
statsRoutes.get('/summary', async (c) => {
  const { userId } = c.var.requestContext;
  const result = await c.var.services.stats.getSummary(userId);
  return c.json({ data: result });
});

// GET /stats/weekly
statsRoutes.get('/weekly', async (c) => {
  const { userId, timezone } = c.var.requestContext;
  const query = weeklyQuerySchema.parse({ date: c.req.query('date') });
  const result = await c.var.services.stats.getWeekly(userId, timezone, query.date);
  return c.json({ data: result });
});

// GET /stats/monthly
statsRoutes.get('/monthly', async (c) => {
  const { userId } = c.var.requestContext;
  const query = monthlyQuerySchema.parse({
    year: c.req.query('year'),
    month: c.req.query('month'),
  });
  const result = await c.var.services.stats.getMonthly(userId, query.year, query.month);
  return c.json({ data: result });
});

export { statsRoutes };
