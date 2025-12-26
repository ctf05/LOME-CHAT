import {
  frontendEnvSchema,
  type ConversationResponse,
  type MessageResponse,
  type ListConversationsResponse,
  type GetConversationResponse,
  type CreateConversationRequest,
  type CreateConversationResponse,
  type UpdateConversationRequest,
  type UpdateConversationResponse,
  type DeleteConversationResponse,
  type CreateMessageRequest,
  type CreateMessageResponse,
} from '@lome-chat/shared';

// Re-export types for consumers
export type {
  ConversationResponse as Conversation,
  MessageResponse as Message,
  ListConversationsResponse as ConversationsResponse,
  GetConversationResponse as ConversationResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  UpdateConversationRequest,
  UpdateConversationResponse,
  DeleteConversationResponse,
  CreateMessageRequest,
  CreateMessageResponse,
};

const env = frontendEnvSchema.parse({
  VITE_API_URL: import.meta.env['VITE_API_URL'] as unknown,
});

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...init } = options;

  // Build headers safely without spreading potentially problematic types
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge additional headers if provided
  if (init.headers) {
    const additionalHeaders =
      init.headers instanceof Headers
        ? Object.fromEntries(init.headers.entries())
        : Array.isArray(init.headers)
          ? Object.fromEntries(init.headers)
          : init.headers;
    Object.assign(headers, additionalHeaders);
  }

  const fetchOptions: RequestInit = {
    ...init,
    headers,
    credentials: 'include',
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${env.VITE_API_URL}${path}`, fetchOptions);

  const data: unknown = await response.json();

  if (!response.ok) {
    const errorMessage =
      typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Request failed';
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body });
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },
};
