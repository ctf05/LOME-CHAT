import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(err);

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json({ error: 'Internal Server Error' }, 500);
};
