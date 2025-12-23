import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { personas, DEV_PASSWORD } from '@lome-chat/shared';

// Mock drizzle-orm before importing
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
}));

// Mock dotenv to prevent loading .env.development during tests
vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

// Mock hashPassword to return predictable value
vi.mock('@lome-chat/db', () => {
  return {
    createDb: vi.fn(() => ({
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => Promise.resolve()),
      })),
    })),
    LOCAL_NEON_DEV_CONFIG: {},
    users: { id: 'id' },
    conversations: { id: 'id' },
    messages: { id: 'id' },
    projects: { id: 'id' },
    accounts: { id: 'id' },
    hashPassword: vi.fn(() => Promise.resolve('mocksalt:mockkey')),
  };
});

vi.mock('@lome-chat/db/factories', () => ({
  userFactory: {
    build: vi.fn((overrides?: { id?: string; email?: string; name?: string }) => ({
      id: overrides?.id ?? 'test-user-id',
      email: overrides?.email ?? 'test@example.com',
      name: overrides?.name ?? 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  },
  conversationFactory: {
    build: vi.fn((overrides?: { id?: string; userId?: string; title?: string }) => ({
      id: overrides?.id ?? 'test-conv-id',
      userId: overrides?.userId ?? 'test-user-id',
      title: overrides?.title ?? 'Test Conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  },
  messageFactory: {
    build: vi.fn(
      (overrides?: {
        id?: string;
        conversationId?: string;
        role?: string;
        content?: string;
        model?: string | null;
      }) => ({
        id: overrides?.id ?? 'test-msg-id',
        conversationId: overrides?.conversationId ?? 'test-conv-id',
        role: overrides?.role ?? 'user',
        content: overrides?.content ?? 'Test message',
        model: overrides?.model ?? null,
        createdAt: new Date(),
      })
    ),
  },
  projectFactory: {
    build: vi.fn(
      (overrides?: {
        id?: string;
        userId?: string;
        name?: string;
        description?: string | null;
      }) => ({
        id: overrides?.id ?? 'test-project-id',
        userId: overrides?.userId ?? 'test-user-id',
        name: overrides?.name ?? 'Test Project',
        description: overrides?.description ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
  },
}));

import {
  SEED_CONFIG,
  generateSeedData,
  generatePersonaData,
  upsertEntity,
  seed,
  seedUUID,
} from './seed';

describe('seed script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SEED_CONFIG', () => {
    it('defines moderate data amounts', () => {
      expect(SEED_CONFIG.USER_COUNT).toBe(5);
      expect(SEED_CONFIG.PROJECTS_PER_USER).toBe(2);
      expect(SEED_CONFIG.CONVERSATIONS_PER_USER).toBe(2);
      expect(SEED_CONFIG.MESSAGES_PER_CONVERSATION).toBe(5);
    });
  });

  describe('seedUUID', () => {
    it('generates valid UUID format', () => {
      const uuid = seedUUID('test');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('generates deterministic UUIDs', () => {
      const uuid1 = seedUUID('test');
      const uuid2 = seedUUID('test');
      expect(uuid1).toBe(uuid2);
    });

    it('generates different UUIDs for different inputs', () => {
      const uuid1 = seedUUID('test1');
      const uuid2 = seedUUID('test2');
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateSeedData', () => {
    it('generates correct number of users', () => {
      const data = generateSeedData();
      expect(data.users).toHaveLength(SEED_CONFIG.USER_COUNT);
    });

    it('generates deterministic user IDs as valid UUIDs', () => {
      const data = generateSeedData();
      // Check that IDs are deterministic (same call produces same IDs)
      expect(data.users[0].id).toBe(seedUUID('seed-user-1'));
      expect(data.users[4].id).toBe(seedUUID('seed-user-5'));
      // Check that IDs are valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(data.users[0].id).toMatch(uuidRegex);
    });

    it('generates correct number of projects (2 per user)', () => {
      const data = generateSeedData();
      const expectedProjects = SEED_CONFIG.USER_COUNT * SEED_CONFIG.PROJECTS_PER_USER;
      expect(data.projects).toHaveLength(expectedProjects);
    });

    it('generates correct number of conversations (2 per user)', () => {
      const data = generateSeedData();
      const expectedConversations = SEED_CONFIG.USER_COUNT * SEED_CONFIG.CONVERSATIONS_PER_USER;
      expect(data.conversations).toHaveLength(expectedConversations);
    });

    it('generates correct number of messages (5 per conversation)', () => {
      const data = generateSeedData();
      const expectedMessages =
        SEED_CONFIG.USER_COUNT *
        SEED_CONFIG.CONVERSATIONS_PER_USER *
        SEED_CONFIG.MESSAGES_PER_CONVERSATION;
      expect(data.messages).toHaveLength(expectedMessages);
    });

    it('links projects to correct users', () => {
      const data = generateSeedData();
      const user1Id = seedUUID('seed-user-1');
      const user1Projects = data.projects.filter((p) => p.userId === user1Id);
      expect(user1Projects).toHaveLength(SEED_CONFIG.PROJECTS_PER_USER);
    });

    it('links conversations to correct users', () => {
      const data = generateSeedData();
      const user1Id = seedUUID('seed-user-1');
      const user1Convs = data.conversations.filter((c) => c.userId === user1Id);
      expect(user1Convs).toHaveLength(SEED_CONFIG.CONVERSATIONS_PER_USER);
    });

    it('links messages to correct conversations', () => {
      const data = generateSeedData();
      const conv1Id = data.conversations[0].id;
      const conv1Messages = data.messages.filter((m) => m.conversationId === conv1Id);
      expect(conv1Messages).toHaveLength(SEED_CONFIG.MESSAGES_PER_CONVERSATION);
    });

    it('alternates message roles between user and assistant', () => {
      const data = generateSeedData();
      const conv1Id = data.conversations[0].id;
      const conv1Messages = data.messages.filter((m) => m.conversationId === conv1Id);

      // First message should be 'user', second 'assistant', etc.
      expect(conv1Messages[0].role).toBe('user');
      expect(conv1Messages[1].role).toBe('assistant');
      expect(conv1Messages[2].role).toBe('user');
    });
  });

  describe('upsertEntity', () => {
    it('returns "created" when entity does not exist', async () => {
      const mockDb = {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          values: vi.fn(() => Promise.resolve()),
        })),
      };

      const result = await upsertEntity(mockDb as never, { id: 'id' } as never, {
        id: 'test-1',
        name: 'Test',
      });

      expect(result).toBe('created');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('returns "exists" when entity already exists', async () => {
      const mockDb = {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve([{ id: 'test-1' }])),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          values: vi.fn(() => Promise.resolve()),
        })),
      };

      const result = await upsertEntity(mockDb as never, { id: 'id' } as never, {
        id: 'test-1',
        name: 'Test',
      });

      expect(result).toBe('exists');
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('seed', () => {
    it('throws if DATABASE_URL is not set', async () => {
      delete process.env.DATABASE_URL;

      await expect(seed()).rejects.toThrow('DATABASE_URL is required');
    });

    it('seeds all entities without throwing', async () => {
      // With mocked db, this should complete without errors
      await expect(seed()).resolves.not.toThrow();
    });
  });

  describe('generatePersonaData', () => {
    it('generates all three personas', async () => {
      const data = await generatePersonaData();
      expect(data.users).toHaveLength(3);
    });

    it('includes alice, bob, and charlie users', async () => {
      const data = await generatePersonaData();
      const emails = data.users.map((u) => u.email);
      expect(emails).toContain('alice@example.com');
      expect(emails).toContain('bob@example.com');
      expect(emails).toContain('charlie@example.com');
    });

    it('uses fixed UUIDs from personas definition', async () => {
      const data = await generatePersonaData();
      const alice = data.users.find((u) => u.email === 'alice@example.com');
      expect(alice?.id).toBe(personas.alice.id);
    });

    it('generates accounts for each persona', async () => {
      const data = await generatePersonaData();
      expect(data.accounts).toHaveLength(3);
    });

    it('links accounts to correct users', async () => {
      const data = await generatePersonaData();
      const aliceAccount = data.accounts.find((a) => a.userId === personas.alice.id);
      expect(aliceAccount).toBeDefined();
      expect(aliceAccount?.providerId).toBe('credential');
    });

    it('accounts have hashed passwords', async () => {
      const data = await generatePersonaData();
      for (const account of data.accounts) {
        // Check password is set (mocked to 'mocksalt:mockkey')
        expect(account.password).toBeDefined();
        expect(account.password).not.toBe(DEV_PASSWORD);
      }
    });

    it('generates sample data only for alice', async () => {
      const data = await generatePersonaData();

      // Alice should have projects
      const aliceProjects = data.projects.filter((p) => p.userId === personas.alice.id);
      expect(aliceProjects.length).toBeGreaterThan(0);

      // Alice should have conversations
      const aliceConversations = data.conversations.filter((c) => c.userId === personas.alice.id);
      expect(aliceConversations.length).toBeGreaterThan(0);

      // Bob should have no projects or conversations
      const bobProjects = data.projects.filter((p) => p.userId === personas.bob.id);
      const bobConversations = data.conversations.filter((c) => c.userId === personas.bob.id);
      expect(bobProjects).toHaveLength(0);
      expect(bobConversations).toHaveLength(0);

      // Charlie should have no projects or conversations
      const charlieProjects = data.projects.filter((p) => p.userId === personas.charlie.id);
      const charlieConversations = data.conversations.filter(
        (c) => c.userId === personas.charlie.id
      );
      expect(charlieProjects).toHaveLength(0);
      expect(charlieConversations).toHaveLength(0);
    });

    it('alice has exactly 2 projects', async () => {
      const data = await generatePersonaData();
      const aliceProjects = data.projects.filter((p) => p.userId === personas.alice.id);
      expect(aliceProjects).toHaveLength(2);
    });

    it('alice has exactly 3 conversations', async () => {
      const data = await generatePersonaData();
      const aliceConversations = data.conversations.filter((c) => c.userId === personas.alice.id);
      expect(aliceConversations).toHaveLength(3);
    });

    it('sets emailVerified correctly from persona definition', async () => {
      const data = await generatePersonaData();
      const alice = data.users.find((u) => u.email === 'alice@example.com');
      const bob = data.users.find((u) => u.email === 'bob@example.com');
      const charlie = data.users.find((u) => u.email === 'charlie@example.com');

      expect(alice?.emailVerified).toBe(true);
      expect(bob?.emailVerified).toBe(true);
      expect(charlie?.emailVerified).toBe(false);
    });
  });
});
