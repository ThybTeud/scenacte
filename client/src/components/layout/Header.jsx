import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/plays" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary">SCENACTE</h1>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bonjour, <span className="font-medium">{user?.username}</span>
              </span>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  Profil
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
