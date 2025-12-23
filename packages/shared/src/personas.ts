/**
 * Developer personas for local development and testing.
 * These users are created by the seed script and can be used for:
 * - Quick login switching during development
 * - Pre-authenticated E2E tests
 *
 * WARNING: Never use these in production.
 */

/** Shared password for all dev personas. Only for local development. */
export const DEV_PASSWORD = 'password123';

/**
 * Predefined developer personas with fixed UUIDs for idempotent seeding.
 */
export const personas = {
  alice: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'alice@example.com',
    name: 'Alice Developer',
    emailVerified: true,
  },
  bob: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'bob@example.com',
    name: 'Bob Tester',
    emailVerified: true,
  },
  charlie: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'charlie@example.com',
    name: 'Charlie Unverified',
    emailVerified: false,
  },
} as const;

/** Union type of all persona names */
export type PersonaName = keyof typeof personas;

/** Type of a single persona */
export type Persona = (typeof personas)[PersonaName];
