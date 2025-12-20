import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // TanStack Router requires throwing redirect objects
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({ to: '/chat' });
  },
});
