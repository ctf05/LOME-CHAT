import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { useUIStore } from '@/stores/ui';

// Mock the chat hooks
vi.mock('@/hooks/chat', () => ({
  useConversations: vi.fn(),
  useDeleteConversation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateConversation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

import { useConversations } from '@/hooks/chat';

const mockUseConversations = vi.mocked(useConversations);

// Mock router for SidebarContent children
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
    <a href={to} className={className}>
      {children}
    </a>
  ),
  useParams: () => ({ conversationId: undefined }),
}));

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

describe('Sidebar', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: true });
    // Default mock: return conversations
    mockUseConversations.mockReturnValue({
      data: [
        {
          id: 'conv-1',
          userId: 'user-1',
          title: 'Test Chat',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useConversations>);
  });

  describe('desktop view', () => {
    it('renders aside element', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('renders SidebarHeader', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
    });

    it('renders SidebarFooter', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
    });

    it('has w-60 class when sidebar is open', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('w-60');
    });

    it('has w-12 class when sidebar is collapsed (rail mode)', () => {
      useUIStore.setState({ sidebarOpen: false });
      render(<Sidebar />, { wrapper: createWrapper() });
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('w-12');
    });

    it('uses sidebar background color', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('bg-sidebar');
    });

    it('uses sidebar border color', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('border-sidebar-border');
    });

    it('uses sidebar foreground color', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('text-sidebar-foreground');
    });

    it('has transition class for smooth animation', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('transition-[width]');
    });

    it('has right border', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('border-r');
    });
  });

  describe('content area', () => {
    it('renders SidebarContent navigation', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
    });

    it('renders NewChatButton', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument();
    });

    it('renders Search input', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('renders ProjectsLink', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  describe('data fetching', () => {
    it('calls useConversations hook', () => {
      render(<Sidebar />, { wrapper: createWrapper() });
      expect(mockUseConversations).toHaveBeenCalled();
    });

    it('shows loading state when fetching', () => {
      mockUseConversations.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useConversations>);

      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows empty state when no conversations', () => {
      mockUseConversations.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as unknown as ReturnType<typeof useConversations>);

      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });

    it('displays conversations from hook', () => {
      mockUseConversations.mockReturnValue({
        data: [
          {
            id: 'conv-1',
            userId: 'user-1',
            title: 'First Chat',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          {
            id: 'conv-2',
            userId: 'user-1',
            title: 'Second Chat',
            createdAt: '2024-01-02',
            updatedAt: '2024-01-02',
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useConversations>);

      render(<Sidebar />, { wrapper: createWrapper() });
      expect(screen.getByText('First Chat')).toBeInTheDocument();
      expect(screen.getByText('Second Chat')).toBeInTheDocument();
    });
  });
});
