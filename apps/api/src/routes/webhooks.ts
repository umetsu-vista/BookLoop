import { Hono } from 'hono';
import { Webhook } from 'svix';
import { createDatabase } from '../db/index';
import { users, readingGoals, streaks } from '../db/schema';
import { generateId } from '../lib/id';
import { nowISO } from '../lib/date';
import { eq } from 'drizzle-orm';

type Env = {
  Bindings: {
    CLERK_WEBHOOK_SECRET: string;
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
  };
};

const webhookRoutes = new Hono<Env>();

webhookRoutes.post('/clerk', async (c) => {
  const secret = c.env.CLERK_WEBHOOK_SECRET;
  const svixId = c.req.header('svix-id');
  const svixTimestamp = c.req.header('svix-timestamp');
  const svixSignature = c.req.header('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json({ error: 'Missing svix headers' }, 400);
  }

  const body = await c.req.text();
  const wh = new Webhook(secret);

  let payload: {
    type: string;
    data: {
      id: string;
      first_name?: string;
      last_name?: string;
      image_url?: string;
      email_addresses?: Array<{ email_address: string }>;
    };
  };

  try {
    payload = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof payload;
  } catch {
    return c.json({ error: 'Invalid signature' }, 400);
  }

  const db = createDatabase(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
  const now = nowISO();

  switch (payload.type) {
    case 'user.created': {
      const displayName =
        [payload.data.first_name, payload.data.last_name].filter(Boolean).join(' ') || 'User';
      const email = payload.data.email_addresses?.[0]?.email_address ?? null;

      await db.insert(users).values({
        id: payload.data.id,
        displayName,
        avatarUrl: payload.data.image_url ?? null,
        email,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(readingGoals).values({
        id: generateId(),
        userId: payload.data.id,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(streaks).values({
        id: generateId(),
        userId: payload.data.id,
        updatedAt: now,
      });

      break;
    }
    case 'user.updated': {
      const displayName =
        [payload.data.first_name, payload.data.last_name].filter(Boolean).join(' ') || 'User';
      const email = payload.data.email_addresses?.[0]?.email_address ?? null;

      await db
        .update(users)
        .set({
          displayName,
          avatarUrl: payload.data.image_url ?? null,
          email,
          updatedAt: now,
        })
        .where(eq(users.id, payload.data.id));
      break;
    }
    case 'user.deleted': {
      await db.delete(users).where(eq(users.id, payload.data.id));
      break;
    }
  }

  return c.json({ received: true });
});

export { webhookRoutes };
