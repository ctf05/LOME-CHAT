import { describe, it, expect } from 'vitest';
import { personas, DEV_PASSWORD, type PersonaName } from '../personas.js';

describe('personas', () => {
  describe('DEV_PASSWORD', () => {
    it('is a non-empty string', () => {
      expect(typeof DEV_PASSWORD).toBe('string');
      expect(DEV_PASSWORD.length).toBeGreaterThan(0);
    });
  });

  describe('persona definitions', () => {
    it('has exactly three personas: alice, bob, charlie', () => {
      const personaNames = Object.keys(personas);
      expect(personaNames).toHaveLength(3);
      expect(personaNames).toContain('alice');
      expect(personaNames).toContain('bob');
      expect(personaNames).toContain('charlie');
    });

    it('all personas have required fields', () => {
      for (const [name, persona] of Object.entries(personas)) {
        expect(persona.id, `${name}.id`).toBeDefined();
        expect(persona.email, `${name}.email`).toBeDefined();
        expect(persona.name, `${name}.name`).toBeDefined();
        expect(typeof persona.emailVerified, `${name}.emailVerified`).toBe('boolean');
      }
    });

    it('all personas have valid UUID format for id', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      for (const [name, persona] of Object.entries(personas)) {
        expect(persona.id, `${name}.id should be valid UUID`).toMatch(uuidRegex);
      }
    });

    it('all personas have unique UUIDs', () => {
      const ids = Object.values(personas).map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all personas have unique emails', () => {
      const emails = Object.values(personas).map((p) => p.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(emails.length);
    });

    it('all personas have valid email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const [name, persona] of Object.entries(personas)) {
        expect(persona.email, `${name}.email should be valid email`).toMatch(emailRegex);
      }
    });
  });

  describe('alice persona', () => {
    it('is verified', () => {
      expect(personas.alice.emailVerified).toBe(true);
    });

    it('has expected email', () => {
      expect(personas.alice.email).toBe('alice@example.com');
    });
  });

  describe('bob persona', () => {
    it('is verified', () => {
      expect(personas.bob.emailVerified).toBe(true);
    });

    it('has expected email', () => {
      expect(personas.bob.email).toBe('bob@example.com');
    });
  });

  describe('charlie persona', () => {
    it('is NOT verified', () => {
      expect(personas.charlie.emailVerified).toBe(false);
    });

    it('has expected email', () => {
      expect(personas.charlie.email).toBe('charlie@example.com');
    });
  });

  describe('PersonaName type', () => {
    it('allows valid persona names', () => {
      const validNames: PersonaName[] = ['alice', 'bob', 'charlie'];
      expect(validNames).toHaveLength(3);
    });
  });
});
