import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AppEnv } from '../types.js';

vi.mock('@lome-chat/db', () => ({
  createDb: vi.fn(() => ({ mocked: 'db' })),
  LOCAL_NEON_DEV_CONFIG: { mocked: 'config' },
}));

vi.mock('../auth/index.js', () => ({
  createAuth: vi.fn(() => ({
    mocked: 'auth',
    api: {
      getSession: vi.fn(),
    },
  })),
}));

vi.mock('../services/email/index.js', () => ({
  createResendEmailClient: vi.fn(() => ({ type: 'resend' })),
  createConsoleEmailClient: vi.fn(() => ({ type: 'console' })),
}));

import { dbMiddleware, authMiddleware, sessionMiddleware } from './dependencies.js';
import { createDb, LOCAL_NEON_DEV_CONFIG } from '@lome-chat/db';
import { createAuth } from '../auth/index.js';
import { createResendEmailClient, createConsoleEmailClient } from '../services/email/index.js';

describe('dbMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets db on context', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.get('/', (c) => {
      c.get('db');
      return c.json({ hasDb: true });
    });

    const res = await app.request(
      '/',
      {},
      { DATABASE_URL: 'postgres://test', NODE_ENV: 'production' }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ hasDb: true });
  });

  it('uses LOCAL_NEON_DEV_CONFIG in development mode', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.get('/', (c) => c.json({ ok: true }));

    await app.request('/', {}, { DATABASE_URL: 'postgres://test', NODE_ENV: 'development' });

    expect(createDb).toHaveBeenCalledWith({
      connectionString: 'postgres://test',
      neonDev: LOCAL_NEON_DEV_CONFIG,
    });
  });

  it('omits neonDev config in production mode', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.get('/', (c) => c.json({ ok: true }));

    await app.request('/', {}, { DATABASE_URL: 'postgres://test', NODE_ENV: 'production' });

    expect(createDb).toHaveBeenCalledWith({
      connectionString: 'postgres://test',
    });
  });

  it('calls next() to continue middleware chain', async () => {
    const app = new Hono<AppEnv>();
    const nextCalled = vi.fn();
    app.use('*', dbMiddleware());
    app.use('*', async (_, next) => {
      nextCalled();
      await next();
    });
    app.get('/', (c) => c.json({ ok: true }));

    await app.request('/', {}, { DATABASE_URL: 'postgres://test' });

    expect(nextCalled).toHaveBeenCalled();
  });
});

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets auth on context', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.use('*', authMiddleware());
    app.get('/', (c) => {
      c.get('auth');
      return c.json({ hasAuth: true });
    });

    const res = await app.request('/', {}, { DATABASE_URL: 'postgres://test' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ hasAuth: true });
  });

  it('uses ResendEmailClient when RESEND_API_KEY is set', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.use('*', authMiddleware());
    app.get('/', (c) => c.json({ ok: true }));

    await app.request('/', {}, { DATABASE_URL: 'postgres://test', RESEND_API_KEY: 'test-key' });

    expect(createResendEmailClient).toHaveBeenCalledWith('test-key');
    expect(createConsoleEmailClient).not.toHaveBeenCalled();
  });

  it('uses ConsoleEmailClient when RESEND_API_KEY is not set', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.use('*', authMiddleware());
    app.get('/', (c) => c.json({ ok: true }));

    await app.request('/', {}, { DATABASE_URL: 'postgres://test' });

    expect(createConsoleEmailClient).toHaveBeenCalled();
    expect(createResendEmailClient).not.toHaveBeenCalled();
  });

  it('uses default auth URL when BETTER_AUTH_URL not set', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.use('*', authMiddleware());
    app.get('/', (c) => c.json({ ok: true }));

    await app.request('/', {}, { DATABASE_URL: 'postgres://test' });

    expect(createAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'http://localhost:8787',
      })
    );
  });

  it('uses custom auth URL when BETTER_AUTH_URL is set', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.use('*', authMiddleware());
    app.get('/', (c) => c.json({ ok: true }));

    await app.request(
      '/',
      {},
      { DATABASE_URL: 'postgres://test', BETTER_AUTH_URL: 'https://api.example.com' }
    );

    expect(createAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'https://api.example.com',
      })
    );
  });

  it('uses default secret when BETTER_AUTH_SECRET not set', async () => {
    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.use('*', authMiddleware());
    app.get('/', (c) => c.json({ ok: true }));

    await app.request('/', {}, { DATABASE_URL: 'postgres://test' });

    expect(createAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        secret: 'dev-secret-minimum-32-characters-long',
      })
    );
  });
});

describe('sessionMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets user and session on context when authenticated', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' };
    const mockSession = { id: 'session-1', userId: 'user-1', expiresAt: new Date() };

    vi.mocked(createAuth).mockReturnValue({
      mocked: 'auth',
      api: {
        getSession: vi.fn().mockResolvedValue({ user: mockUser, session: mockSession }),
      },
    } as unknown as ReturnType<typeof createAuth>);

    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.use('*', authMiddleware());
    app.use('*', sessionMiddleware());
    app.get('/', (c) => {
      const user = c.get('user');
      const session = c.get('session');
      return c.json({ userId: user?.id, sessionId: session?.id });
    });

    const res = await app.request('/', {}, { DATABASE_URL: 'postgres://test' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ userId: 'user-1', sessionId: 'session-1' });
  });

  it('sets user and session to null when not authenticated', async () => {
    vi.mocked(createAuth).mockReturnValue({
      mocked: 'auth',
      api: {
        getSession: vi.fn().mockResolvedValue(null),
      },
    } as unknown as ReturnType<typeof createAuth>);

    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.use('*', authMiddleware());
    app.use('*', sessionMiddleware());
    app.get('/', (c) => {
      const user = c.get('user');
      const session = c.get('session');
      return c.json({ user, session });
    });

    const res = await app.request('/', {}, { DATABASE_URL: 'postgres://test' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ user: null, session: null });
  });

  it('passes request headers to getSession', async () => {
    const mockGetSession = vi.fn().mockResolvedValue(null);
    vi.mocked(createAuth).mockReturnValue({
      mocked: 'auth',
      api: {
        getSession: mockGetSession,
      },
    } as unknown as ReturnType<typeof createAuth>);

    const app = new Hono<AppEnv>();
    app.use('*', dbMiddleware());
    app.use('*', authMiddleware());
    app.use('*', sessionMiddleware());
    app.get('/', (c) => c.json({ ok: true }));

    await app.request(
      '/',
      { headers: { Cookie: 'session=abc123' } },
      { DATABASE_URL: 'postgres://test' }
    );

    expect(mockGetSession).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.any(Headers) as object,
      })
    );
  });
});
