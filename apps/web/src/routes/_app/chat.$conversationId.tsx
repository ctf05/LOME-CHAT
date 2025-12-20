import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/chat/$conversationId')({
  component: function ChatConversation() {
    const { conversationId } = Route.useParams();
    return <>Conversation: {conversationId}</>;
  },
});
