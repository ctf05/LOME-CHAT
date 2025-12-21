import { Hono } from 'hono';

export const authRoute = new Hono()
  .post('/signup', (c) => c.json({ error: 'Not implemented' }, 501))
  .post('/login', (c) => c.json({ error: 'Not implemented' }, 501))
  .post('/logout', (c) => c.json({ error: 'Not implemented' }, 501))
  .get('/session', (c) => c.json({ error: 'Not implemented' }, 501));
