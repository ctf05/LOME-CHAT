import { cors as honoCors } from 'hono/cors';

export function cors(): ReturnType<typeof honoCors> {
  return honoCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });
}
