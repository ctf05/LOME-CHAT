import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

const notImplementedErrorSchema = z.object({
  error: z.literal('Not implemented'),
});

const streamChatRoute = createRoute({
  method: 'post',
  path: '/stream',
  responses: {
    501: {
      content: { 'application/json': { schema: notImplementedErrorSchema } },
      description: 'Streaming chat not yet implemented',
    },
  },
});

export const chatRoute = new OpenAPIHono().openapi(streamChatRoute, (c) => {
  return c.json({ error: 'Not implemented' as const }, 501);
});
