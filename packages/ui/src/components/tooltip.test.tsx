import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';

describe('Tooltip', () => {
  it('renders trigger element', () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('trigger has data-slot attribute', () => {
    render(
      <Tooltip>
        <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    );
    expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'tooltip-trigger');
  });

  it('renders as button by default', () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders open tooltip when defaultOpen is true', () => {
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent data-testid="content">Tooltip text</TooltipContent>
      </Tooltip>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('applies custom className to content', () => {
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent className="custom-class" data-testid="content">
          Tooltip text
        </TooltipContent>
      </Tooltip>
    );
    expect(screen.getByTestId('content')).toHaveClass('custom-class');
  });
});

describe('TooltipProvider', () => {
  it('renders children', () => {
    render(
      <TooltipProvider>
        <div>Child content</div>
      </TooltipProvider>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('accepts custom delayDuration', () => {
    render(
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText('Hover')).toBeInTheDocument();
  });
});
