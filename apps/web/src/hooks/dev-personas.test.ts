import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { devPersonaKeys, useDevPersonas } from './dev-personas';
import type { DevPersonasResponse } from '@lome-chat/shared';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.stubGlobal('import.meta', {
  env: {
    DEV: true,
    VITE_API_URL: 'http://localhost:8787',
  },
});

function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('devPersonaKeys', () => {
  describe('all', () => {
    it('returns base dev-personas key', () => {
      expect(devPersonaKeys.all).toEqual(['dev-personas']);
    });
  });

  describe('list', () => {
    it('returns list key array', () => {
      expect(devPersonaKeys.list()).toEqual(['dev-personas', 'list']);
    });
  });
});

describe('useDevPersonas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches personas from API', async () => {
    const mockResponse: DevPersonasResponse = {
      personas: [
        {
          id: 'user-1',
          name: 'Alice Developer',
          email: 'alice@dev.lome-chat.com',
          emailVerified: true,
          image: null,
          stats: { conversationCount: 3, messageCount: 12, projectCount: 2 },
          credits: '$0.00',
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useDevPersonas(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8787/dev/personas');
  });

  it('handles fetch errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useDevPersonas(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to fetch dev personas');
  });

  it('returns empty array when no personas', async () => {
    const mockResponse: DevPersonasResponse = { personas: [] };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useDevPersonas(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.personas).toEqual([]);
  });
});
