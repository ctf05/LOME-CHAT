/* eslint-disable @typescript-eslint/unbound-method -- vitest mocks are self-bound */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  chatKeys,
  useConversations,
  useConversation,
  useMessages,
  useCreateConversation,
  useSendMessage,
  useDeleteConversation,
  useUpdateConversation,
} from './chat';

// Mock the api module
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../lib/api';

const mockApi = vi.mocked(api);

function createWrapper(): ({ children }: { children: ReactNode }) => ReactNode {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

describe('chatKeys', () => {
  describe('all', () => {
    it('returns base chat key', () => {
      expect(chatKeys.all).toEqual(['chat']);
    });
  });

  describe('conversations', () => {
    it('returns conversations key array', () => {
      expect(chatKeys.conversations()).toEqual(['chat', 'conversations']);
    });
  });

  describe('conversation', () => {
    it('returns conversation key with id', () => {
      expect(chatKeys.conversation('conv-123')).toEqual(['chat', 'conversations', 'conv-123']);
    });
  });

  describe('messages', () => {
    it('returns messages key with conversation id', () => {
      expect(chatKeys.messages('conv-123')).toEqual([
        'chat',
        'conversations',
        'conv-123',
        'messages',
      ]);
    });
  });
});

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fetches conversations from API', async () => {
    const mockConversations = [
      {
        id: '1',
        userId: 'user-1',
        title: 'Test',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];
    mockApi.get.mockResolvedValueOnce({ conversations: mockConversations });

    const { result } = renderHook(() => useConversations(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.get).toHaveBeenCalledWith('/conversations');
    expect(result.current.data).toEqual(mockConversations);
  });

  it('handles API errors', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useConversations(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network error');
  });
});

describe('useConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fetches single conversation from API', async () => {
    const mockConversation = {
      id: 'conv-1',
      userId: 'user-1',
      title: 'Test',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    const mockMessages = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        createdAt: '2024-01-01',
      },
    ];
    mockApi.get.mockResolvedValueOnce({ conversation: mockConversation, messages: mockMessages });

    const { result } = renderHook(() => useConversation('conv-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.get).toHaveBeenCalledWith('/conversations/conv-1');
    expect(result.current.data).toEqual(mockConversation);
  });

  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useConversation(''), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.get).not.toHaveBeenCalled();
  });
});

describe('useMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('fetches messages from API', async () => {
    const mockConversation = {
      id: 'conv-1',
      userId: 'user-1',
      title: 'Test',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    const mockMessages = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        createdAt: '2024-01-01',
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'Hi!',
        createdAt: '2024-01-01',
      },
    ];
    mockApi.get.mockResolvedValueOnce({ conversation: mockConversation, messages: mockMessages });

    const { result } = renderHook(() => useMessages('conv-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.get).toHaveBeenCalledWith('/conversations/conv-1');
    expect(result.current.data).toEqual(mockMessages);
  });

  it('is disabled when conversationId is empty', () => {
    const { result } = renderHook(() => useMessages(''), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it('handles API errors', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Conversation not found'));

    const { result } = renderHook(() => useMessages('invalid-id'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Conversation not found');
  });
});

describe('useCreateConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('calls POST /conversations with correct body', async () => {
    const mockResponse = {
      conversation: {
        id: 'conv-1',
        userId: 'user-1',
        title: 'New Chat',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };
    mockApi.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCreateConversation(), { wrapper: createWrapper() });

    result.current.mutate({ title: 'New Chat' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/conversations', { title: 'New Chat' });
    expect(result.current.data).toEqual(mockResponse);
  });

  it('returns conversation and message when firstMessage provided', async () => {
    const mockResponse = {
      conversation: {
        id: 'conv-1',
        userId: 'user-1',
        title: '',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      message: {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello!',
        createdAt: '2024-01-01',
      },
    };
    mockApi.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCreateConversation(), { wrapper: createWrapper() });

    result.current.mutate({ firstMessage: { content: 'Hello!' } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/conversations', {
      firstMessage: { content: 'Hello!' },
    });
    expect(result.current.data?.message?.content).toBe('Hello!');
  });

  it('handles API errors correctly', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useCreateConversation(), { wrapper: createWrapper() });

    result.current.mutate({ title: 'Test' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Unauthorized');
  });
});

describe('useSendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('calls POST /conversations/:id/messages with correct body', async () => {
    const mockResponse = {
      message: {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello AI!',
        createdAt: '2024-01-01',
      },
    };
    mockApi.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() });

    result.current.mutate({
      conversationId: 'conv-1',
      message: { role: 'user', content: 'Hello AI!' },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/conversations/conv-1/messages', {
      role: 'user',
      content: 'Hello AI!',
    });
    expect(result.current.data).toEqual(mockResponse);
  });

  it('includes model field when provided', async () => {
    const mockResponse = {
      message: {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'Response',
        model: 'gpt-4',
        createdAt: '2024-01-01',
      },
    };
    mockApi.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() });

    result.current.mutate({
      conversationId: 'conv-1',
      message: { role: 'assistant', content: 'Response', model: 'gpt-4' },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/conversations/conv-1/messages', {
      role: 'assistant',
      content: 'Response',
      model: 'gpt-4',
    });
  });

  it('handles conversation not found error', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Conversation not found'));

    const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() });

    result.current.mutate({
      conversationId: 'invalid-id',
      message: { role: 'user', content: 'Hello' },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Conversation not found');
  });

  it('handles validation errors for empty content', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Validation failed'));

    const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() });

    result.current.mutate({
      conversationId: 'conv-1',
      message: { role: 'user', content: '' },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Validation failed');
  });
});

describe('useDeleteConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('calls DELETE /conversations/:id', async () => {
    const mockResponse = { deleted: true };
    mockApi.delete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useDeleteConversation(), { wrapper: createWrapper() });

    result.current.mutate('conv-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.delete).toHaveBeenCalledWith('/conversations/conv-1');
    expect(result.current.data).toEqual(mockResponse);
  });

  it('handles 404 error when conversation already deleted', async () => {
    mockApi.delete.mockRejectedValueOnce(new Error('Conversation not found'));

    const { result } = renderHook(() => useDeleteConversation(), { wrapper: createWrapper() });

    result.current.mutate('deleted-id');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Conversation not found');
  });

  it('handles unauthorized error', async () => {
    mockApi.delete.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useDeleteConversation(), { wrapper: createWrapper() });

    result.current.mutate('conv-1');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Unauthorized');
  });
});

describe('useUpdateConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('calls PATCH /conversations/:id with title', async () => {
    const mockResponse = {
      conversation: {
        id: 'conv-1',
        userId: 'user-1',
        title: 'Updated Title',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      },
    };
    mockApi.patch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdateConversation(), { wrapper: createWrapper() });

    result.current.mutate({
      conversationId: 'conv-1',
      data: { title: 'Updated Title' },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.patch).toHaveBeenCalledWith('/conversations/conv-1', { title: 'Updated Title' });
    expect(result.current.data?.conversation.title).toBe('Updated Title');
  });

  it('handles 404 error for non-existent conversation', async () => {
    mockApi.patch.mockRejectedValueOnce(new Error('Conversation not found'));

    const { result } = renderHook(() => useUpdateConversation(), { wrapper: createWrapper() });

    result.current.mutate({
      conversationId: 'invalid-id',
      data: { title: 'New Title' },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Conversation not found');
  });

  it('handles validation error for empty title', async () => {
    mockApi.patch.mockRejectedValueOnce(new Error('Title is required'));

    const { result } = renderHook(() => useUpdateConversation(), { wrapper: createWrapper() });

    result.current.mutate({
      conversationId: 'conv-1',
      data: { title: '' },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Title is required');
  });

  it('handles validation error for title exceeding max length', async () => {
    mockApi.patch.mockRejectedValueOnce(new Error('Title too long'));

    const { result } = renderHook(() => useUpdateConversation(), { wrapper: createWrapper() });

    const longTitle = 'a'.repeat(256);
    result.current.mutate({
      conversationId: 'conv-1',
      data: { title: longTitle },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Title too long');
  });
});
