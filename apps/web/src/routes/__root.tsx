import { Outlet, createRootRoute, Navigate } from '@tanstack/react-router';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';

function NotFoundRedirect(): React.JSX.Element {
  return <Navigate to="/chat" />;
}

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <QueryProvider>
        <Outlet />
      </QueryProvider>
    </ThemeProvider>
  ),
  notFoundComponent: NotFoundRedirect,
});
