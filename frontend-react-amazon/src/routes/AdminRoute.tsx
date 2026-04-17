import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from './routes';

export function AdminRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user?.role !== 'admin') return <Navigate to={ROUTES.HOME} replace />;
  return <Outlet />;
}
