import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApp } from './app.js';

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

  describe('auth routes (placeholders)', () => {
    it('returns 501 for POST /auth/signup', async () => {
      const app = createApp();
      const res = await app.request('/auth/signup', { method: 'POST' });

      expect(res.status).toBe(501);
      const body: { error: string } = await res.json();
      expect(body.error).toBe('Not implemented');
    });

    it('returns 501 for POST /auth/login', async () => {
      const app = createApp();
      const res = await app.request('/auth/login', { method: 'POST' });

      expect(res.status).toBe(501);
    });

    it('returns 501 for POST /auth/logout', async () => {
      const app = createApp();
      const res = await app.request('/auth/logout', { method: 'POST' });

      expect(res.status).toBe(501);
    });

    it('returns 501 for GET /auth/session', async () => {
      const app = createApp();
      const res = await app.request('/auth/session');

      expect(res.status).toBe(501);
    });
  });

  describe('conversations routes (placeholders)', () => {
    it('returns 501 for GET /conversations', async () => {
      const app = createApp();
      const res = await app.request('/conversations');

      expect(res.status).toBe(501);
    });

    it('returns 501 for POST /conversations', async () => {
      const app = createApp();
      const res = await app.request('/conversations', { method: 'POST' });

      expect(res.status).toBe(501);
    });

    it('returns 501 for GET /conversations/:id', async () => {
      const app = createApp();
      const res = await app.request('/conversations/123');

      expect(res.status).toBe(501);
    });

    it('returns 501 for DELETE /conversations/:id', async () => {
      const app = createApp();
      const res = await app.request('/conversations/123', { method: 'DELETE' });

      expect(res.status).toBe(501);
    });

    it('returns 501 for PATCH /conversations/:id', async () => {
      const app = createApp();
      const res = await app.request('/conversations/123', { method: 'PATCH' });

      expect(res.status).toBe(501);
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
});
