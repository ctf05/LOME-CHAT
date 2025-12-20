import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('renders children', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-slot', 'avatar');
  });

  it('applies custom className', () => {
    render(
      <Avatar className="custom-class" data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('avatar')).toHaveClass('custom-class');
  });

  it('has default size classes', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('avatar')).toHaveClass('size-8');
  });

  it('has rounded-full class', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('avatar')).toHaveClass('rounded-full');
  });
});

describe('AvatarImage', () => {
  it('renders without error when image provided', () => {
    // AvatarImage uses Radix's loading state detection
    // which doesn't work in jsdom. We test that it renders without error.
    expect(() =>
      render(
        <Avatar>
          <AvatarImage src="test.jpg" alt="Test" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
    ).not.toThrow();
  });
});

describe('AvatarFallback', () => {
  it('renders fallback text', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="fallback">JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('fallback')).toHaveAttribute('data-slot', 'avatar-fallback');
  });

  it('applies custom className', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-class" data-testid="fallback">
          JD
        </AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('fallback')).toHaveClass('custom-class');
  });

  it('renders icon as fallback', () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="fallback">
          <svg data-testid="icon" />
        </AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('has centered content', () => {
    render(
      <Avatar>
        <AvatarFallback data-testid="fallback">JD</AvatarFallback>
      </Avatar>
    );
    const fallback = screen.getByTestId('fallback');
    expect(fallback).toHaveClass('flex');
    expect(fallback).toHaveClass('items-center');
    expect(fallback).toHaveClass('justify-center');
  });
});
