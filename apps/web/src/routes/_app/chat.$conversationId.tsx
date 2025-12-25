import * as React from 'react';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { ChatHeader } from '@/components/chat/chat-header';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { useConversation, useMessages } from '@/hooks/chat';
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

  const isLoading = isConversationLoading || isMessagesLoading;

  // Local messages for new chat (before API create)
  const [localMessages, setLocalMessages] = React.useState<Message[]>([]);

  // Combine API messages with local messages
  const allMessages = React.useMemo(() => {
    if (isNewChat) {
      return localMessages;
    }
    return [...(apiMessages ?? []), ...localMessages];
  }, [apiMessages, localMessages, isNewChat]);

  const handleSend = (content: string): void => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: isNewChat ? 'pending' : conversationId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, newMessage]);

    // Simulate assistant response (will be replaced with real streaming API)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        conversationId: isNewChat ? 'pending' : conversationId,
        role: 'assistant',
        content: `This is a mock response to: "${content}"`,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  // Determine the chat title
  const chatTitle = isNewChat
    ? 'New Chat'
    : (conversation?.title ?? `Chat ${conversationId.slice(0, 8)}...`);

  if (isLoading && !isNewChat) {
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
  if (!isNewChat && !isLoading && !conversation) {
    return <Navigate to="/chat" />;
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader title={chatTitle} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {allMessages.length > 0 && <MessageList messages={allMessages} />}
      </div>
      <div className="border-t">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
