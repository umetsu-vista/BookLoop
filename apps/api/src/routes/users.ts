import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { createDatabase } from '../db/index';
import { users, readingGoals } from '../db/schema';
import { nowISO } from '../lib/date';
import { AppError } from '../lib/errors';
import { updateProfileSchema, updateGoalsSchema } from '@bookloop/shared';
import type { Services } from '../services/factory';

type Env = {
  Variables: {
    requestContext: { userId: string; timezone: string };
    services: Services;
  };
  Bindings: {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
  };
};

const userRoutes = new Hono<Env>();

// GET /users/me
userRoutes.get('/me', async (c) => {
  const { userId } = c.var.requestContext;
  const db = createDatabase(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AppError(404, 'NOT_FOUND', 'ユーザーが見つかりません');

  return c.json({ data: user });
});

// PATCH /users/me
userRoutes.patch('/me', async (c) => {
  const { userId } = c.var.requestContext;
  const body = await c.req.json();
  const data = updateProfileSchema.parse(body);
  const db = createDatabase(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  await db
    .update(users)
    .set({ ...data, updatedAt: nowISO() })
    .where(eq(users.id, userId));

  const [updated] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return c.json({ data: updated });
});

// DELETE /users/me
userRoutes.delete('/me', async (c) => {
  const { userId } = c.var.requestContext;
  const db = createDatabase(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
  await db.delete(users).where(eq(users.id, userId));
  return c.json({ data: { deleted: true } });
});

// GET /users/me/goals
userRoutes.get('/me/goals', async (c) => {
  const { userId } = c.var.requestContext;
  const db = createDatabase(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  const [goal] = await db
    .select()
    .from(readingGoals)
    .where(eq(readingGoals.userId, userId))
    .limit(1);

  return c.json({ data: goal ?? null });
});

// PUT /users/me/goals
userRoutes.put('/me/goals', async (c) => {
  const { userId } = c.var.requestContext;
  const body = await c.req.json();
  const data = updateGoalsSchema.parse(body);
  const db = createDatabase(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  await db
    .update(readingGoals)
    .set({ ...data, updatedAt: nowISO() })
    .where(eq(readingGoals.userId, userId));

  const [updated] = await db
    .select()
    .from(readingGoals)
    .where(eq(readingGoals.userId, userId))
    .limit(1);

  return c.json({ data: updated });
});

export { userRoutes };
