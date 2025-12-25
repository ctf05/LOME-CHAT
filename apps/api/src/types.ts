import type { betterAuth } from 'better-auth';
import type { Database } from '@lome-chat/db';

export interface Bindings {
  DATABASE_URL: string;
  NODE_ENV?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  RESEND_API_KEY?: string;
  FRONTEND_URL?: string;
}

export interface Variables {
  db: Database;
  auth: ReturnType<typeof betterAuth>;
  user: { id: string; email: string; name: string | null } | null;
  session: { id: string; userId: string; expiresAt: Date } | null;
}

export interface AppEnv {
  Bindings: Bindings;
  Variables: Variables;
}
