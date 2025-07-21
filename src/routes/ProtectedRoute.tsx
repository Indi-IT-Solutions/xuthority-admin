import { Navigate } from 'react-router-dom';
import useAdminStore from '@/store/useAdminStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAdminStore((state) => state.isLoggedIn);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 