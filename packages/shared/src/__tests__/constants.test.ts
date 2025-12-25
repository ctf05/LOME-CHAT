import { describe, it, expect } from 'vitest';
import { MESSAGE_ROLES, DEV_PASSWORD, DEV_EMAIL_DOMAIN } from '../constants.js';

describe('MESSAGE_ROLES', () => {
  it('contains user, assistant, and system roles', () => {
    expect(MESSAGE_ROLES).toEqual(['user', 'assistant', 'system']);
  });
});

describe('DEV_PASSWORD', () => {
  it('is a non-empty string', () => {
    expect(typeof DEV_PASSWORD).toBe('string');
    expect(DEV_PASSWORD.length).toBeGreaterThan(0);
  });

  it('has at least 8 characters for minimal security', () => {
    expect(DEV_PASSWORD.length).toBeGreaterThanOrEqual(8);
  });
});

describe('DEV_EMAIL_DOMAIN', () => {
  it('is dev.lome-chat.com', () => {
    expect(DEV_EMAIL_DOMAIN).toBe('dev.lome-chat.com');
  });
});
