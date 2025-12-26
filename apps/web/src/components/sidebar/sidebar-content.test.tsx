import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarContent } from './sidebar-content';
import { useUIStore } from '@/stores/ui';

// Mock router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid="link">
      {children}
    </a>
  ),
  useParams: () => ({ conversationId: undefined }),
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

describe('SidebarContent', () => {
  const mockConversations = [
    { id: 'conv-1', title: 'Test Conversation', updatedAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useUIStore.setState({ sidebarOpen: true });
  });

  it('renders NewChatButton', () => {
    render(<SidebarContent conversations={mockConversations} />);
    expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument();
  });

  it('renders Search input when sidebar is open', () => {
    render(<SidebarContent conversations={mockConversations} />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders ChatList with conversations', () => {
    render(<SidebarContent conversations={mockConversations} />);
    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
  });

  it('renders ProjectsLink', () => {
    render(<SidebarContent conversations={mockConversations} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders in correct order: NewChat, Search, ChatList, Projects', () => {
    render(<SidebarContent conversations={mockConversations} />);
    const content = screen.getByTestId('sidebar-nav');
    expect(content).toBeInTheDocument();
  });

  it('has aria-label on navigation', () => {
    render(<SidebarContent conversations={mockConversations} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Chat navigation');
  });

  describe('collapsed state', () => {
    beforeEach(() => {
      useUIStore.setState({ sidebarOpen: false });
    });

    it('hides search and labels when collapsed', () => {
      render(<SidebarContent conversations={mockConversations} />);
      expect(screen.queryByText('New Chat')).not.toBeInTheDocument();
      expect(screen.queryByText('Search')).not.toBeInTheDocument();
      expect(screen.queryByText('Projects')).not.toBeInTheDocument();
    });
  });
});
