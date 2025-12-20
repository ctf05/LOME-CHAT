import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { toast } from 'sonner';
import { Toaster } from './sonner';

describe('Toaster', () => {
  it('renders toaster container', () => {
    render(<Toaster />);
    // Sonner renders a section element for notifications
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('displays toast message', async () => {
    render(<Toaster />);
    toast('Test message');
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('displays success toast', async () => {
    render(<Toaster />);
    toast.success('Success message');
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('displays error toast', async () => {
    render(<Toaster />);
    toast.error('Error message');
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('displays warning toast', async () => {
    render(<Toaster />);
    toast.warning('Warning message');
    await waitFor(() => {
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });
  });

  it('displays info toast', async () => {
    render(<Toaster />);
    toast.info('Info message');
    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });
});
