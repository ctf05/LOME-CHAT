import { describe, it, expect } from 'vitest';
import {
  devPersonaStatsSchema,
  devPersonaSchema,
  devPersonasResponseSchema,
} from '../schemas/dev-persona.js';

describe('devPersonaStatsSchema', () => {
  it('validates complete stats object', () => {
    const stats = {
      conversationCount: 5,
      messageCount: 20,
      projectCount: 2,
    };
    expect(() => devPersonaStatsSchema.parse(stats)).not.toThrow();
  });

  it('requires non-negative integers', () => {
    expect(() =>
      devPersonaStatsSchema.parse({
        conversationCount: -1,
        messageCount: 0,
        projectCount: 0,
      })
    ).toThrow();
  });

  it('rejects non-integer values', () => {
    expect(() =>
      devPersonaStatsSchema.parse({
        conversationCount: 1.5,
        messageCount: 0,
        projectCount: 0,
      })
    ).toThrow();
  });

  it('requires all fields', () => {
    expect(() =>
      devPersonaStatsSchema.parse({
        conversationCount: 5,
      })
    ).toThrow();
  });
});

describe('devPersonaSchema', () => {
  const validPersona = {
    id: 'abc123',
    name: 'Alice Developer',
    email: 'alice@dev.lome-chat.com',
    emailVerified: true,
    image: null,
    stats: {
      conversationCount: 5,
      messageCount: 20,
      projectCount: 2,
    },
    credits: '$0.00',
  };

  it('validates a complete persona', () => {
    expect(() => devPersonaSchema.parse(validPersona)).not.toThrow();
  });

  it('validates persona with image URL', () => {
    const withImage = { ...validPersona, image: 'https://example.com/avatar.png' };
    expect(() => devPersonaSchema.parse(withImage)).not.toThrow();
  });

  it('requires valid email', () => {
    const invalid = { ...validPersona, email: 'not-an-email' };
    expect(() => devPersonaSchema.parse(invalid)).toThrow();
  });

  it('requires all fields', () => {
    // Omit required field to test validation
    const missing = {
      id: validPersona.id,
      name: validPersona.name,
      email: validPersona.email,
      emailVerified: validPersona.emailVerified,
      image: validPersona.image,
      stats: validPersona.stats,
      // credits intentionally omitted
    };
    expect(() => devPersonaSchema.parse(missing)).toThrow();
  });
});

describe('devPersonasResponseSchema', () => {
  it('validates empty personas array', () => {
    expect(() => devPersonasResponseSchema.parse({ personas: [] })).not.toThrow();
  });

  it('validates array with multiple personas', () => {
    const response = {
      personas: [
        {
          id: 'abc123',
          name: 'Alice',
          email: 'alice@dev.lome-chat.com',
          emailVerified: true,
          image: null,
          stats: { conversationCount: 0, messageCount: 0, projectCount: 0 },
          credits: '$0.00',
        },
        {
          id: 'def456',
          name: 'Bob',
          email: 'bob@dev.lome-chat.com',
          emailVerified: true,
          image: null,
          stats: { conversationCount: 3, messageCount: 15, projectCount: 1 },
          credits: '$5.00',
        },
      ],
    };
    expect(() => devPersonasResponseSchema.parse(response)).not.toThrow();
  });

  it('rejects response without personas key', () => {
    expect(() => devPersonasResponseSchema.parse({})).toThrow();
  });
});
