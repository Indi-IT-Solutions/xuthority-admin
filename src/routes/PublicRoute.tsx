import { Navigate } from 'react-router-dom';
import useAdminStore from '@/store/useAdminStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useAdminStore((state) => state.isLoggedIn);

  if (isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute; 