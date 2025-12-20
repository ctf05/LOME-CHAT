import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Content</Card>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<CardHeader data-testid="header">Content</CardHeader>);
    expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'card-header');
  });

  it('applies custom className', () => {
    render(
      <CardHeader className="custom-class" data-testid="header">
        Content
      </CardHeader>
    );
    expect(screen.getByTestId('header')).toHaveClass('custom-class');
  });
});

describe('CardTitle', () => {
  it('renders children', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    expect(screen.getByTestId('title')).toHaveAttribute('data-slot', 'card-title');
  });

  it('applies custom className', () => {
    render(
      <CardTitle className="custom-class" data-testid="title">
        Title
      </CardTitle>
    );
    expect(screen.getByTestId('title')).toHaveClass('custom-class');
  });
});

describe('CardDescription', () => {
  it('renders children', () => {
    render(<CardDescription>Description</CardDescription>);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<CardDescription data-testid="desc">Desc</CardDescription>);
    expect(screen.getByTestId('desc')).toHaveAttribute('data-slot', 'card-description');
  });

  it('applies custom className', () => {
    render(
      <CardDescription className="custom-class" data-testid="desc">
        Desc
      </CardDescription>
    );
    expect(screen.getByTestId('desc')).toHaveClass('custom-class');
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'card-content');
  });

  it('applies custom className', () => {
    render(
      <CardContent className="custom-class" data-testid="content">
        Content
      </CardContent>
    );
    expect(screen.getByTestId('content')).toHaveClass('custom-class');
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'card-footer');
  });

  it('applies custom className', () => {
    render(
      <CardFooter className="custom-class" data-testid="footer">
        Footer
      </CardFooter>
    );
    expect(screen.getByTestId('footer')).toHaveClass('custom-class');
  });
});

describe('CardAction', () => {
  it('renders children', () => {
    render(<CardAction>Action</CardAction>);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('has data-slot attribute', () => {
    render(<CardAction data-testid="action">Action</CardAction>);
    expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'card-action');
  });

  it('applies custom className', () => {
    render(
      <CardAction className="custom-class" data-testid="action">
        Action
      </CardAction>
    );
    expect(screen.getByTestId('action')).toHaveClass('custom-class');
  });
});

describe('Card composition', () => {
  it('renders full card with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
