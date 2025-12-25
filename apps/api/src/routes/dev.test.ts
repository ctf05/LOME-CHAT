import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createDevRoute } from './dev.js';
import type { DevPersonasResponse } from '@lome-chat/shared';
import type { AppEnv } from '../types.js';

interface MockUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function createMockDb(
  devUsers: MockUser[],
  counts: { conv: number; msg: number; proj: number } = { conv: 0, msg: 0, proj: 0 }
) {
  const mockSelect = vi.fn();
  const mockFrom = vi.fn();
  const mockWhere = vi.fn();
  const mockInnerJoin = vi.fn();

  mockSelect.mockReturnValue({ from: mockFrom });
  mockFrom.mockImplementation(() => ({
    where: mockWhere,
    innerJoin: mockInnerJoin,
  }));
  mockInnerJoin.mockReturnValue({ where: mockWhere });

  let callCount = 0;
  mockWhere.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      return Promise.resolve(devUsers);
    }
    const countType = (callCount - 2) % 3;
    if (countType === 0) return Promise.resolve([{ count: counts.conv }]);
    if (countType === 1) return Promise.resolve([{ count: counts.msg }]);
    return Promise.resolve([{ count: counts.proj }]);
  });

  return { select: mockSelect };
}

function createTestApp(mockDb: ReturnType<typeof createMockDb>): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use('*', async (c, next) => {
    c.set('db', mockDb as unknown as AppEnv['Variables']['db']);
    await next();
  });
  app.route('/dev', createDevRoute());
  return app;
}

describe('createDevRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /personas', () => {
    it('returns 200 with personas array', async () => {
      const mockDb = createMockDb([
        {
          id: 'user-1',
          name: 'Alice Developer',
          email: 'alice@dev.lome-chat.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const app = createTestApp(mockDb);
      const res = await app.request('/dev/personas');
      expect(res.status).toBe(200);

      const body: DevPersonasResponse = await res.json();
      expect(body.personas).toBeDefined();
      expect(Array.isArray(body.personas)).toBe(true);
    });

    it('returns empty array when no dev users exist', async () => {
      const mockDb = createMockDb([]);
      const app = createTestApp(mockDb);

      const res = await app.request('/dev/personas');
      const body: DevPersonasResponse = await res.json();

      expect(body.personas).toEqual([]);
    });

    it('includes user fields in response', async () => {
      const mockDb = createMockDb([
        {
          id: 'user-1',
          name: 'Alice Developer',
          email: 'alice@dev.lome-chat.com',
          emailVerified: true,
          image: 'https://example.com/alice.png',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const app = createTestApp(mockDb);
      const res = await app.request('/dev/personas');
      const body: DevPersonasResponse = await res.json();

      expect(body.personas[0]).toMatchObject({
        id: 'user-1',
        name: 'Alice Developer',
        email: 'alice@dev.lome-chat.com',
        emailVerified: true,
        image: 'https://example.com/alice.png',
      });
    });

    it('returns credits as $0.00 placeholder', async () => {
      const mockDb = createMockDb([
        {
          id: 'user-1',
          name: 'Alice',
          email: 'alice@dev.lome-chat.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const app = createTestApp(mockDb);
      const res = await app.request('/dev/personas');
      const body: DevPersonasResponse = await res.json();

      expect(body.personas[0]?.credits).toBe('$0.00');
    });

    it('includes stats for each persona', async () => {
      const mockDb = createMockDb(
        [
          {
            id: 'user-1',
            name: 'Alice',
            email: 'alice@dev.lome-chat.com',
            emailVerified: true,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        { conv: 3, msg: 12, proj: 2 }
      );

      const app = createTestApp(mockDb);
      const res = await app.request('/dev/personas');
      const body: DevPersonasResponse = await res.json();

      const persona = body.personas[0];
      expect(persona?.stats).toBeDefined();
      expect(typeof persona?.stats.conversationCount).toBe('number');
      expect(typeof persona?.stats.messageCount).toBe('number');
      expect(typeof persona?.stats.projectCount).toBe('number');
    });

    it('handles multiple personas', async () => {
      const mockDb = createMockDb([
        {
          id: 'user-1',
          name: 'Alice',
          email: 'alice@dev.lome-chat.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          name: 'Bob',
          email: 'bob@dev.lome-chat.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const app = createTestApp(mockDb);
      const res = await app.request('/dev/personas');
      const body: DevPersonasResponse = await res.json();

      expect(body.personas).toHaveLength(2);
    });
  });
});
