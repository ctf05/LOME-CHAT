import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AppShell } from './app-shell';
import { useUIStore } from '@/stores/ui';

// Mock the chat hooks
vi.mock('@/hooks/chat', () => ({
  useConversations: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  })),
  useDeleteConversation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateConversation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// Mock router for Sidebar children
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

describe('AppShell', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: true });
  });

  it('renders children', () => {
    render(
      <AppShell>
        <div data-testid="child-content">Hello World</div>
      </AppShell>,
      { wrapper: createWrapper() }
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders Sidebar', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { wrapper: createWrapper() }
    );
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('has flex layout', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { wrapper: createWrapper() }
    );
    const shell = screen.getByTestId('app-shell');
    expect(shell).toHaveClass('flex');
  });

  it('fills screen height', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { wrapper: createWrapper() }
    );
    const shell = screen.getByTestId('app-shell');
    expect(shell).toHaveClass('h-screen');
  });

  it('renders main content area', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { wrapper: createWrapper() }
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('main area takes remaining space', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { wrapper: createWrapper() }
    );
    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex-1');
  });

  it('main area handles overflow', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { wrapper: createWrapper() }
    );
    const main = screen.getByRole('main');
    expect(main).toHaveClass('overflow-hidden');
  });
});
