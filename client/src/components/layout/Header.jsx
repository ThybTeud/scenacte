import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Dropdown, DropdownItem } from '../ui/Dropdown';

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
          {/* Logo à gauche */}
          <Link to="/plays" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary">#SCENACTE</h1>
          </Link>

          {/* Navigation à droite */}
          {isAuthenticated && (
            <div className="flex items-center space-x-6">
              {/* Lien Bibliothèque */}
              <Link
                to="/plays"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Bibliothèque
              </Link>

              {/* Dropdown Profil */}
              <Dropdown
                trigger={
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }
              >
                <DropdownItem
                  onClick={() => navigate('/profile')}
                  icon={
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                >
                  Profil
                </DropdownItem>
                <DropdownItem
                  onClick={() => navigate('/preferences')}
                  icon={
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                >
                  Préférences
                </DropdownItem>
                <div className="border-t border-gray-200 my-1"></div>
                <DropdownItem
                  onClick={handleLogout}
                  icon={
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  }
                >
                  Déconnexion
                </DropdownItem>
              </Dropdown>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
