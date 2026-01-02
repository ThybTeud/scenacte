import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';

export function PrivateRoute({ children, allowGuest = false }) {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  // Si allowGuest est activé, on autorise l'accès même en mode invité
  if (!isAuthenticated && !allowGuest) {
    return <Navigate to="/login" replace />;
  }

  // Si allowGuest est activé et qu'on est en mode invité, on autorise
  if (!isAuthenticated && allowGuest && isGuest) {
    return children;
  }

  // Si authentifié, on autorise toujours
  if (isAuthenticated) {
    return children;
  }

  // Sinon, redirection vers login
  return <Navigate to="/login" replace />;
}
