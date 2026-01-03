import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';

export function PrivateRoute({ children, requireAuth = false }) {
  const { user, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  // Si authentification requise, seul un utilisateur connecté peut accéder
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Sinon, mode invité OU utilisateur connecté = accès autorisé
  if (isGuest || user) {
    return children;
  }

  // Cas par défaut : redirection login
  return <Navigate to="/login" replace />;
}
