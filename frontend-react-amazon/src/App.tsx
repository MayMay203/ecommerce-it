import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { queryClient } from '@/shared/lib/queryClient';
import { router } from '@/routes';
import { useInitAuth } from '@/features/auth';

function AuthGate() {
  const isReady = useInitAuth();
  if (!isReady) return null;
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}
