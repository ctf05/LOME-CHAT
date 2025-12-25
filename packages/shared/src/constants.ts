export const MESSAGE_ROLES = ['user', 'assistant', 'system'] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

/** Shared password for all dev personas. Only for local development. */
export const DEV_PASSWORD = 'password123';

/** Email domain for development personas */
export const DEV_EMAIL_DOMAIN = 'dev.lome-chat.com';
