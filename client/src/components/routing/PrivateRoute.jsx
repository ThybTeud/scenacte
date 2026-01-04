import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';

export function PrivateRoute({ children, requireAuth = false }) {
  const { user, guestMode, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  // Si authentification requise, seul un utilisateur connecté peut accéder
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Utilisateur connecté → OK
  if (user) {
    return children;
  }

  // Mode invité explicite → OK
  if (guestMode) {
    return children;
  }

  // Sinon → redirection login
  return <Navigate to="/login" replace />;
}
