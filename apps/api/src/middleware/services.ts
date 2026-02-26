import { createMiddleware } from 'hono/factory';
import { createDatabase } from '../db/index';
import { createServices } from '../services/factory';
import { applyPartialIndexes } from '../db/partial-indexes';
import type { Services } from '../services/factory';

type Env = {
  Bindings: {
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
  };
  Variables: {
    services: Services;
  };
};

let partialIndexesApplied = false;

export const servicesMiddleware = createMiddleware<Env>(async (c, next) => {
  const db = createDatabase(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);

  // パーシャルインデックスを初回リクエスト時に適用（冪等）
  if (!partialIndexesApplied) {
    c.executionCtx.waitUntil(
      applyPartialIndexes(db).then(() => {
        partialIndexesApplied = true;
      }),
    );
  }

  const services = createServices(db);
  c.set('services', services);
  await next();
});
