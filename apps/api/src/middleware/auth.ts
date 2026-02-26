import { createMiddleware } from 'hono/factory';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { AppError } from '../lib/errors';

type Env = {
  Bindings: {
    CLERK_DOMAIN: string;
  };
  Variables: {
    requestContext: {
      userId: string;
      timezone: string;
    };
  };
};

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが必要です');
  }

  const token = authHeader.slice(7);
  const clerkDomain = c.env.CLERK_DOMAIN;

  if (!jwks) {
    const jwksUrl = new URL(`https://${clerkDomain}/.well-known/jwks.json`);
    jwks = createRemoteJWKSet(jwksUrl);
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://${clerkDomain}`,
    });

    const userId = payload.sub;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', '無効なトークンです');
    }

    const timezone = c.req.header('X-Timezone') || 'Asia/Tokyo';

    c.set('requestContext', { userId, timezone });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, 'UNAUTHORIZED', '認証に失敗しました');
  }

  await next();
});
