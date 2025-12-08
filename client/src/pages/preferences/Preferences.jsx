import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import HeaderGlobal from '../../components/layout/HeaderGlobal';
import { Card } from '../../components/ui/Card';

export function Preferences() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Menu items pour le HeaderGlobal
  const menuItems = [
    {
      label: 'Profil',
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Préférences',
      onClick: () => navigate('/preferences'),
    },
    {
      label: 'Déconnexion',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <HeaderGlobal user={user} menuItems={menuItems} />

      <main className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold font-ui text-black mb-6">Préférences</h1>

          <Card>
            <p className="text-black font-ui">
              Cette page est en cours de développement. Les préférences seront bientôt disponibles.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
