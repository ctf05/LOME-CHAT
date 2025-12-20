import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScrollArea } from './scroll-area';

describe('ScrollArea', () => {
  it('renders children', () => {
    render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>
    );
    expect(screen.getByText('Scrollable content')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );
    expect(screen.getByTestId('scroll-area')).toHaveAttribute('data-slot', 'scroll-area');
  });

  it('applies custom className', () => {
    render(
      <ScrollArea className="custom-class" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );
    expect(screen.getByTestId('scroll-area')).toHaveClass('custom-class');
  });

  it('renders with fixed height for scrolling', () => {
    render(
      <ScrollArea className="h-48" data-testid="scroll-area">
        <div style={{ height: '500px' }}>Tall content</div>
      </ScrollArea>
    );
    expect(screen.getByTestId('scroll-area')).toHaveClass('h-48');
  });

  it('renders viewport with data-slot', () => {
    render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    expect(viewport).toBeInTheDocument();
  });

  it('has relative positioning', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );
    expect(screen.getByTestId('scroll-area')).toHaveClass('relative');
  });

  it('viewport contains children', () => {
    render(
      <ScrollArea>
        <div data-testid="child">Child content</div>
      </ScrollArea>
    );
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    expect(viewport).toContainElement(screen.getByTestId('child'));
  });
});
