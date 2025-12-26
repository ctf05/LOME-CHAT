import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatList } from './chat-list';
import { useUIStore } from '@/stores/ui';

// Mock Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid="chat-link">
      {children}
    </a>
  ),
  useParams: () => ({ conversationId: undefined }),
  useNavigate: () => vi.fn(),
}));

// Mock chat hooks used by ChatItem
vi.mock('@/hooks/chat', () => ({
  useDeleteConversation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateConversation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('ChatList', () => {
  const mockConversations = [
    { id: 'conv-1', title: 'First Conversation', updatedAt: new Date().toISOString() },
    { id: 'conv-2', title: 'Second Conversation', updatedAt: new Date().toISOString() },
    { id: 'conv-3', title: 'Third Conversation', updatedAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useUIStore.setState({ sidebarOpen: true });
  });

  it('renders list of conversations', () => {
    render(<ChatList conversations={mockConversations} />);
    expect(screen.getByText('First Conversation')).toBeInTheDocument();
    expect(screen.getByText('Second Conversation')).toBeInTheDocument();
    expect(screen.getByText('Third Conversation')).toBeInTheDocument();
  });

  it('renders empty state when no conversations', () => {
    render(<ChatList conversations={[]} />);
    expect(screen.getByText(/no conversations/i)).toBeInTheDocument();
  });

  it('renders conversations as links', () => {
    render(<ChatList conversations={mockConversations} />);
    const links = screen.getAllByTestId('chat-link');
    expect(links).toHaveLength(3);
  });

  it('highlights active conversation', () => {
    render(<ChatList conversations={mockConversations} activeId="conv-2" />);
    const links = screen.getAllByTestId('chat-link');
    // The active styling is on the parent wrapper div, not the link
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const activeLink = links[1]!;
    expect(activeLink.parentElement).toHaveClass('bg-sidebar-border');
  });

  describe('collapsed state', () => {
    beforeEach(() => {
      useUIStore.setState({ sidebarOpen: false });
    });

    it('shows icons only when collapsed', () => {
      render(<ChatList conversations={mockConversations} />);
      expect(screen.queryByText('First Conversation')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('message-icon')).toHaveLength(3);
    });
  });

  describe('accessibility', () => {
    it('renders as a list with proper role', () => {
      render(<ChatList conversations={mockConversations} />);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('has aria-label for the conversation list', () => {
      render(<ChatList conversations={mockConversations} />);
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Conversations');
    });

    it('renders each conversation as a list item', () => {
      render(<ChatList conversations={mockConversations} />);
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });
  });
});
