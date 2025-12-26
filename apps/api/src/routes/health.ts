import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

const healthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
});

const getHealthRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: { 'application/json': { schema: healthResponseSchema } },
      description: 'Service health status',
    },
  },
});

export const healthRoute = new OpenAPIHono().openapi(getHealthRoute, (c) => {
  return c.json(
    {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
    },
    200
  );
});
