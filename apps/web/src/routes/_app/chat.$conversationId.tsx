import * as React from 'react';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { ChatHeader } from '@/components/chat/chat-header';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { useConversation, useMessages, useSendMessage } from '@/hooks/chat';
import type { Message } from '@/lib/api';

export const Route = createFileRoute('/_app/chat/$conversationId')({
  component: ChatConversation,
});

function ChatConversation(): React.JSX.Element {
  const { conversationId } = Route.useParams();
  const isNewChat = conversationId === 'new';

  // Fetch real data for existing conversations
  const { data: conversation, isLoading: isConversationLoading } = useConversation(
    isNewChat ? '' : conversationId
  );
  const { data: apiMessages, isLoading: isMessagesLoading } = useMessages(
    isNewChat ? '' : conversationId
  );

  const sendMessage = useSendMessage();

  const isLoading = isConversationLoading || isMessagesLoading;

  // Local optimistic messages (shown before API confirms)
  const [optimisticMessages, setOptimisticMessages] = React.useState<Message[]>([]);

  // Combine API messages with optimistic messages
  const allMessages = React.useMemo(() => {
    const messages = apiMessages ?? [];
    // Filter out optimistic messages that now exist in API response
    const apiMessageIds = new Set(messages.map((m) => m.id));
    const pendingOptimistic = optimisticMessages.filter((m) => !apiMessageIds.has(m.id));
    return [...messages, ...pendingOptimistic];
  }, [apiMessages, optimisticMessages]);

  // Clear optimistic messages when API messages update
  React.useEffect(() => {
    if (apiMessages && apiMessages.length > 0) {
      setOptimisticMessages([]);
    }
  }, [apiMessages]);

  const handleSend = (content: string): void => {
    if (isNewChat) {
      // Should not happen - NewChatPage handles this
      return;
    }

    // Create optimistic message for immediate UI feedback
    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      conversationId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setOptimisticMessages((prev) => [...prev, optimisticMessage]);

    // Send to API
    sendMessage.mutate(
      {
        conversationId,
        message: {
          role: 'user',
          content,
        },
      },
      {
        onSuccess: () => {
          // Clear optimistic message - API invalidation will fetch real message
          setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        },
        onError: () => {
          // Remove failed optimistic message
          setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        },
      }
    );
  };

  // Determine the chat title
  const chatTitle = isNewChat
    ? 'New Chat'
    : (conversation?.title ?? `Chat ${conversationId.slice(0, 8)}...`);

  // Redirect new chat to /chat - should create via NewChatPage
  if (isNewChat) {
    return <Navigate to="/chat" />;
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <ChatHeader title="Loading..." />
        <div className="flex flex-1 items-center justify-center">
          <span className="text-muted-foreground">Loading conversation...</span>
        </div>
      </div>
    );
  }

  // Redirect to /chat if conversation doesn't exist
  if (!conversation) {
    return <Navigate to="/chat" />;
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader title={chatTitle} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {allMessages.length > 0 && <MessageList messages={allMessages} />}
      </div>
      <div className="border-t">
        <MessageInput onSend={handleSend} disabled={sendMessage.isPending} />
      </div>
    </div>
  );
}
