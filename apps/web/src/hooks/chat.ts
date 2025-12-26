import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  type Conversation,
  type Message,
  type ConversationsResponse,
  type ConversationResponse,
  type CreateConversationRequest,
  type CreateConversationResponse,
  type UpdateConversationRequest,
  type UpdateConversationResponse,
  type DeleteConversationResponse,
  type CreateMessageRequest,
  type CreateMessageResponse,
} from '../lib/api';

// Query key factory
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.conversations(), id] as const,
  messages: (conversationId: string) =>
    [...chatKeys.conversation(conversationId), 'messages'] as const,
};

// Queries
export function useConversations(): ReturnType<typeof useQuery<Conversation[], Error>> {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: async (): Promise<Conversation[]> => {
      const response = await api.get<ConversationsResponse>('/conversations');
      return response.conversations;
    },
  });
}

export function useConversation(id: string): ReturnType<typeof useQuery<Conversation, Error>> {
  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: async (): Promise<Conversation> => {
      const response = await api.get<ConversationResponse>(`/conversations/${id}`);
      return response.conversation;
    },
    enabled: !!id,
  });
}

export function useMessages(conversationId: string): ReturnType<typeof useQuery<Message[], Error>> {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async (): Promise<Message[]> => {
      const response = await api.get<ConversationResponse>(`/conversations/${conversationId}`);
      return response.messages;
    },
    enabled: !!conversationId,
  });
}

// Mutations

/**
 * Creates a new conversation, optionally with a first message.
 */
export function useCreateConversation(): ReturnType<
  typeof useMutation<CreateConversationResponse, Error, CreateConversationRequest>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateConversationRequest): Promise<CreateConversationResponse> => {
      return api.post<CreateConversationResponse>('/conversations', data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/**
 * Sends a message to a conversation.
 */
export function useSendMessage(): ReturnType<
  typeof useMutation<
    CreateMessageResponse,
    Error,
    { conversationId: string; message: CreateMessageRequest }
  >
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: CreateMessageRequest;
    }): Promise<CreateMessageResponse> => {
      return api.post<CreateMessageResponse>(`/conversations/${conversationId}/messages`, message);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.conversationId),
      });
      // Also invalidate conversations list to update updatedAt ordering
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/**
 * Deletes a conversation.
 */
export function useDeleteConversation(): ReturnType<
  typeof useMutation<DeleteConversationResponse, Error, string>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string): Promise<DeleteConversationResponse> => {
      return api.delete<DeleteConversationResponse>(`/conversations/${conversationId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

/**
 * Updates a conversation (rename).
 */
export function useUpdateConversation(): ReturnType<
  typeof useMutation<
    UpdateConversationResponse,
    Error,
    { conversationId: string; data: UpdateConversationRequest }
  >
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: UpdateConversationRequest;
    }): Promise<UpdateConversationResponse> => {
      return api.patch<UpdateConversationResponse>(`/conversations/${conversationId}`, data);
    },
    onSuccess: (_data, variables) => {
      // Invalidate both the specific conversation and the list
      void queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(variables.conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
