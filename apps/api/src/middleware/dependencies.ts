import type { MiddlewareHandler } from 'hono';
import { createDb, LOCAL_NEON_DEV_CONFIG } from '@lome-chat/db';
import { createAuth } from '../auth/index.js';
import { createResendEmailClient, createConsoleEmailClient } from '../services/email/index.js';
import type { AppEnv } from '../types.js';

export function dbMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const dbConfig =
      c.env.NODE_ENV === 'development'
        ? { connectionString: c.env.DATABASE_URL, neonDev: LOCAL_NEON_DEV_CONFIG }
        : { connectionString: c.env.DATABASE_URL };
    c.set('db', createDb(dbConfig));
    await next();
  };
}

export function authMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const db = c.get('db');
    const emailClient = c.env.RESEND_API_KEY
      ? createResendEmailClient(c.env.RESEND_API_KEY)
      : createConsoleEmailClient();

    const auth = createAuth({
      db,
      emailClient,
      baseUrl: c.env.BETTER_AUTH_URL ?? 'http://localhost:8787',
      secret: c.env.BETTER_AUTH_SECRET ?? 'dev-secret-minimum-32-characters-long',
      frontendUrl: c.env.FRONTEND_URL ?? 'http://localhost:5173',
    });

    c.set('auth', auth);
    await next();
  };
}

export function sessionMiddleware(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const auth = c.get('auth');
    const sessionData = await auth.api.getSession({ headers: c.req.raw.headers });

    if (sessionData) {
      c.set('user', sessionData.user as AppEnv['Variables']['user']);
      c.set('session', sessionData.session as AppEnv['Variables']['session']);
    } else {
      c.set('user', null);
      c.set('session', null);
    }

    await next();
  };
}
