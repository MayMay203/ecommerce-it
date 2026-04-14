import { Navigate, Outlet } from 'react-router';
import { ROUTES } from './routes';

// TODO: replace with useAuthStore once auth feature is implemented
function useIsAuthenticated(): boolean {
  // Placeholder — will use useAuthStore from features/auth
  return false;
}

export function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}
