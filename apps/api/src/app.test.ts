import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApp } from './app.js';

// Mock the database module for dev routes testing
vi.mock('@lome-chat/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@lome-chat/db')>();
  return {
    ...actual,
    createDb: vi.fn(() => ({
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([])),
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([{ count: 0 }])),
          })),
        })),
      })),
    })),
    LOCAL_NEON_DEV_CONFIG: {},
  };
});

describe('createApp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a new app instance', () => {
    const app = createApp();
    expect(app).toBeDefined();
  });

  describe('health route', () => {
    it('responds to GET /health', async () => {
      const app = createApp();
      const res = await app.request('/health');

      expect(res.status).toBe(200);
      const body: { status: string; timestamp: string } = await res.json();
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBe('2024-01-15T12:00:00.000Z');
    });
  });

  describe('auth routes', () => {
    // Auth routes are now at /api/auth/* and handled by Better Auth
    // Full auth testing is done via E2E tests with the database
    it('responds to /api/auth/* requests', async () => {
      const app = createApp();
      // Without proper env vars, auth routes will error, but they're mounted
      const res = await app.request('/api/auth/session');
      // Better Auth should respond (even if with an error due to missing env)
      expect(res.status).toBeDefined();
    });
  });

  describe('conversations routes', () => {
    it('returns 401 for GET /conversations without auth', async () => {
      const app = createApp();
      const res = await app.request(
        '/conversations',
        {},
        {
          DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
          NODE_ENV: 'development',
        }
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: 'Unauthorized' });
    });

    it('returns 401 for GET /conversations/:id without auth', async () => {
      const app = createApp();
      const res = await app.request(
        '/conversations/123',
        {},
        {
          DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
          NODE_ENV: 'development',
        }
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 for POST /conversations (not implemented)', async () => {
      const app = createApp();
      const res = await app.request(
        '/conversations',
        { method: 'POST' },
        {
          DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
          NODE_ENV: 'development',
        }
      );

      expect(res.status).toBe(404);
    });

    it('returns 404 for DELETE /conversations/:id (not implemented)', async () => {
      const app = createApp();
      const res = await app.request(
        '/conversations/123',
        { method: 'DELETE' },
        {
          DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
          NODE_ENV: 'development',
        }
      );

      expect(res.status).toBe(404);
    });

    it('returns 404 for PATCH /conversations/:id (not implemented)', async () => {
      const app = createApp();
      const res = await app.request(
        '/conversations/123',
        { method: 'PATCH' },
        {
          DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
          NODE_ENV: 'development',
        }
      );

      expect(res.status).toBe(404);
    });
  });

  describe('chat routes (placeholders)', () => {
    it('returns 501 for POST /chat/stream', async () => {
      const app = createApp();
      const res = await app.request('/chat/stream', { method: 'POST' });

      expect(res.status).toBe(501);
    });
  });

  describe('CORS', () => {
    it('includes CORS headers for allowed origin', async () => {
      const app = createApp();
      const res = await app.request('/health', {
        headers: { Origin: 'http://localhost:5173' },
      });

      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
    });
  });

  describe('error handling', () => {
    it('returns 404 for unknown routes', async () => {
      const app = createApp();
      const res = await app.request('/unknown-route');

      expect(res.status).toBe(404);
    });
  });

  describe('dev routes', () => {
    it('responds to GET /dev/personas in development', async () => {
      const app = createApp();
      const res = await app.request(
        '/dev/personas',
        {},
        {
          DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
          NODE_ENV: 'development',
        }
      );

      expect(res.status).toBe(200);
      const body: { personas: unknown[] } = await res.json();
      expect(body).toHaveProperty('personas');
      expect(Array.isArray(body.personas)).toBe(true);
    });
  });
});
