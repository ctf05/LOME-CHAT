import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { NewChatPage } from '@/components/chat/new-chat-page';
import { useSession } from '@/lib/auth';
import { useCreateConversation } from '@/hooks/chat';

export const Route = createFileRoute('/_app/chat/')({
  component: ChatIndex,
});

function ChatIndex(): React.JSX.Element {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const createConversation = useCreateConversation();

  const handleSend = (content: string): void => {
    // Create conversation with first message via API
    createConversation.mutate(
      { firstMessage: { content } },
      {
        onSuccess: (response) => {
          // Navigate to the new conversation
          void navigate({
            to: '/chat/$conversationId',
            params: { conversationId: response.conversation.id },
          });
        },
      }
    );
  };

  return (
    <div className="flex h-full flex-col">
      <NewChatPage
        onSend={handleSend}
        isAuthenticated={isAuthenticated}
        isLoading={createConversation.isPending}
      />
    </div>
  );
}
