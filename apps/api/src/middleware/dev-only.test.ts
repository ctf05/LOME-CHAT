import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { devOnly } from './dev-only.js';

interface Bindings {
  NODE_ENV?: string;
}

describe('devOnly middleware', () => {
  it('returns 404 when NODE_ENV is production', async () => {
    const app = new Hono<{ Bindings: Bindings }>();
    app.use('*', devOnly());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request('/', {}, { NODE_ENV: 'production' });
    expect(res.status).toBe(404);
  });

  it('returns JSON error body on 404', async () => {
    const app = new Hono<{ Bindings: Bindings }>();
    app.use('*', devOnly());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request('/', {}, { NODE_ENV: 'production' });
    const body = await res.json();
    expect(body).toEqual({ error: 'Not Found' });
  });

  it('allows request when NODE_ENV is development', async () => {
    const app = new Hono<{ Bindings: Bindings }>();
    app.use('*', devOnly());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request('/', {}, { NODE_ENV: 'development' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it('allows request when NODE_ENV is undefined (defaults to dev)', async () => {
    const app = new Hono<{ Bindings: Bindings }>();
    app.use('*', devOnly());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request('/', {}, {});
    expect(res.status).toBe(200);
  });

  it('allows request when NODE_ENV is test', async () => {
    const app = new Hono<{ Bindings: Bindings }>();
    app.use('*', devOnly());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request('/', {}, { NODE_ENV: 'test' });
    expect(res.status).toBe(200);
  });
});
