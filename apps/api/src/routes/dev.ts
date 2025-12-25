import { Hono } from 'hono';
import { like, eq, count } from 'drizzle-orm';
import { users, conversations, messages, projects } from '@lome-chat/db';
import { DEV_EMAIL_DOMAIN } from '@lome-chat/shared';
import type { DevPersona } from '@lome-chat/shared';
import type { AppEnv } from '../types.js';

export function createDevRoute(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get('/personas', async (c) => {
    const db = c.get('db');

    const devUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
      })
      .from(users)
      .where(like(users.email, `%@${DEV_EMAIL_DOMAIN}`));

    const personas: DevPersona[] = await Promise.all(
      devUsers.map(async (user) => {
        const [convCount] = await db
          .select({ count: count() })
          .from(conversations)
          .where(eq(conversations.userId, user.id));

        const [msgCount] = await db
          .select({ count: count() })
          .from(messages)
          .innerJoin(conversations, eq(messages.conversationId, conversations.id))
          .where(eq(conversations.userId, user.id));

        const [projCount] = await db
          .select({ count: count() })
          .from(projects)
          .where(eq(projects.userId, user.id));

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          stats: {
            conversationCount: convCount?.count ?? 0,
            messageCount: msgCount?.count ?? 0,
            projectCount: projCount?.count ?? 0,
          },
          credits: '$0.00',
        };
      })
    );

    return c.json({ personas });
  });

  return app;
}
