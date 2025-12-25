import { Hono } from 'hono';
import { eq, desc, and } from 'drizzle-orm';
import { conversations, messages } from '@lome-chat/db';
import type { AppEnv } from '../types.js';

/**
 * Creates conversations routes.
 * Requires dbMiddleware, authMiddleware, and sessionMiddleware to be applied.
 */
export function createConversationsRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  // GET / - List all conversations for authenticated user
  app.get('/', async (c) => {
    const user = c.get('user');
    const db = c.get('db');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.updatedAt));

    return c.json({ conversations: userConversations });
  });

  // GET /:id - Get single conversation with messages
  app.get('/:id', async (c) => {
    const user = c.get('user');
    const db = c.get('db');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const conversationId = c.req.param('id');

    // Get conversation and verify ownership
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, user.id)));

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    // Get messages for conversation
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return c.json({ conversation, messages: conversationMessages });
  });

  return app;
}

// Legacy placeholder export for backwards compatibility during migration
export const conversationsRoute = new Hono()
  .get('/', (c) => c.json({ error: 'Not implemented' }, 501))
  .post('/', (c) => c.json({ error: 'Not implemented' }, 501))
  .get('/:id', (c) => c.json({ error: 'Not implemented' }, 501))
  .delete('/:id', (c) => c.json({ error: 'Not implemented' }, 501))
  .patch('/:id', (c) => c.json({ error: 'Not implemented' }, 501));
