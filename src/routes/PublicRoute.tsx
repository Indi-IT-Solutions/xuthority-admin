import { Navigate } from 'react-router-dom';
import useAdminStore from '@/store/useAdminStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useAdminStore((state) => state.isLoggedIn);
  // Only allow access to /login, /forgot-password, /reset-password if not authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default PublicRoute; 