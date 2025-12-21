import { Hono } from 'hono';

export const conversationsRoute = new Hono()
  .get('/', (c) => c.json({ error: 'Not implemented' }, 501))
  .post('/', (c) => c.json({ error: 'Not implemented' }, 501))
  .get('/:id', (c) => c.json({ error: 'Not implemented' }, 501))
  .delete('/:id', (c) => c.json({ error: 'Not implemented' }, 501))
  .patch('/:id', (c) => c.json({ error: 'Not implemented' }, 501));
