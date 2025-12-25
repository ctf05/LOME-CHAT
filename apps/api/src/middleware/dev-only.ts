import type { MiddlewareHandler } from 'hono';

interface DevOnlyBindings {
  NODE_ENV?: string;
}

export function devOnly(): MiddlewareHandler<{ Bindings: DevOnlyBindings }> {
  return async (c, next): Promise<Response | undefined> => {
    const env = c.env.NODE_ENV ?? 'development';
    if (env === 'production') {
      return c.json({ error: 'Not Found' }, 404);
    }
    await next();
    return undefined;
  };
}
