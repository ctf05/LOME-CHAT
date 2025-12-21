import { Hono } from 'hono';

export const chatRoute = new Hono().post('/stream', (c) =>
  c.json({ error: 'Not implemented' }, 501)
);
