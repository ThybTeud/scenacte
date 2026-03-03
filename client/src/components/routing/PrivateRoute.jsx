import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/Loader';

export function PrivateRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (user) {
    return children;
  }

  return <Navigate to="/login" replace />;
}
