import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Separator } from './separator';

describe('Separator', () => {
  it('renders separator element', () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId('separator')).toHaveAttribute('data-slot', 'separator');
  });

  it('defaults to horizontal orientation', () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders with vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('is decorative by default (role=none)', () => {
    render(<Separator data-testid="separator" />);
    // When decorative, Radix sets role="none" to hide from assistive tech
    expect(screen.getByTestId('separator')).toHaveAttribute('role', 'none');
  });

  it('is not decorative when set to false', () => {
    render(<Separator decorative={false} data-testid="separator" />);
    expect(screen.getByTestId('separator')).toHaveAttribute('role', 'separator');
  });

  it('applies custom className', () => {
    render(<Separator className="custom-class" data-testid="separator" />);
    expect(screen.getByTestId('separator')).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Separator ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});
