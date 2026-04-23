import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from './routes';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  return isAuthenticated
    ? <Outlet />
    : <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
}
