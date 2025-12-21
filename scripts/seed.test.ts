import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock drizzle-orm before importing
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
}));

// Mock dotenv to prevent loading .env.development during tests
vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

// Mock the db module before importing
vi.mock('@lome-chat/db', () => ({
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
  users: { id: 'id' },
  conversations: { id: 'id' },
  messages: { id: 'id' },
  projects: { id: 'id' },
}));

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

import { SEED_CONFIG, generateSeedData, upsertEntity, seed, seedUUID } from './seed';

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
});
