import { Navigate, Outlet } from 'react-router';
import { ROUTES } from './routes';

// TODO: replace with useAuthStore once auth feature is implemented
function useIsAdmin(): boolean {
  // Placeholder — will use useAuthStore from features/auth
  return false;
}

export function AdminRoute() {
  const isAdmin = useIsAdmin();
  return isAdmin ? <Outlet /> : <Navigate to={ROUTES.HOME} replace />;
}
