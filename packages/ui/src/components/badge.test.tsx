import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<Badge data-testid="badge">Status</Badge>);
    expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'badge');
  });

  it('renders as span by default', () => {
    render(<Badge data-testid="badge">Status</Badge>);
    expect(screen.getByTestId('badge').tagName).toBe('SPAN');
  });

  it('applies default variant classes', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('bg-primary');
  });

  it('applies secondary variant classes', () => {
    render(
      <Badge variant="secondary" data-testid="badge">
        Secondary
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveClass('bg-secondary');
  });

  it('applies destructive variant classes', () => {
    render(
      <Badge variant="destructive" data-testid="badge">
        Destructive
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveClass('bg-destructive');
  });

  it('applies outline variant classes', () => {
    render(
      <Badge variant="outline" data-testid="badge">
        Outline
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveClass('text-foreground');
  });

  it('applies custom className', () => {
    render(
      <Badge className="custom-class" data-testid="badge">
        Custom
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Badge ref={ref}>Ref</Badge>);
    expect(ref).toHaveBeenCalled();
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Badge asChild data-testid="badge">
        <a href="/test">Link Badge</a>
      </Badge>
    );
    expect(screen.getByRole('link')).toHaveTextContent('Link Badge');
  });
});
