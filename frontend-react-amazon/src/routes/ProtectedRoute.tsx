import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from './routes';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}
