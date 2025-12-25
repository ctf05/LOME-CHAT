import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from './user-menu';
import { useUIStore } from '@/stores/ui';

// Mock signOutAndClearCache - use vi.hoisted for mock values referenced in vi.mock factory
const { mockSignOutAndClearCache } = vi.hoisted(() => ({
  mockSignOutAndClearCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/auth', () => ({
  signOutAndClearCache: mockSignOutAndClearCache,
}));

describe('UserMenu', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useUIStore.setState({ sidebarOpen: true });
  });

  describe('expanded state', () => {
    it('renders user avatar', () => {
      render(<UserMenu user={mockUser} />);
      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
    });

    it('renders user name when expanded', () => {
      render(<UserMenu user={mockUser} />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('shows dropdown menu on click', async () => {
      const user = userEvent.setup();
      render(<UserMenu user={mockUser} />);

      await user.click(screen.getByTestId('user-menu-trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('shows Profile option in dropdown', async () => {
      const user = userEvent.setup();
      render(<UserMenu user={mockUser} />);

      await user.click(screen.getByTestId('user-menu-trigger'));
      expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
    });

    it('shows Settings option in dropdown', async () => {
      const user = userEvent.setup();
      render(<UserMenu user={mockUser} />);

      await user.click(screen.getByTestId('user-menu-trigger'));
      expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
    });

    it('shows Sign out option in dropdown', async () => {
      const user = userEvent.setup();
      render(<UserMenu user={mockUser} />);

      await user.click(screen.getByTestId('user-menu-trigger'));
      expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
    });

    it('calls signOutAndClearCache when Sign out is clicked', async () => {
      const user = userEvent.setup();
      render(<UserMenu user={mockUser} />);

      await user.click(screen.getByTestId('user-menu-trigger'));
      await user.click(screen.getByRole('menuitem', { name: /sign out/i }));

      expect(mockSignOutAndClearCache).toHaveBeenCalled();
    });
  });

  describe('collapsed state', () => {
    beforeEach(() => {
      useUIStore.setState({ sidebarOpen: false });
    });

    it('shows only avatar when collapsed', () => {
      render(<UserMenu user={mockUser} />);
      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });
  });

  describe('avatar fallback', () => {
    it('shows initials when no image', () => {
      render(<UserMenu user={mockUser} />);
      expect(screen.getByText('TU')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has aria-label on menu trigger', () => {
      render(<UserMenu user={mockUser} />);
      const trigger = screen.getByTestId('user-menu-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'User menu');
    });
  });
});
