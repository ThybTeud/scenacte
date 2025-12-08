import PropTypes from 'prop-types';
import Logo from './Logo';
import Button from './Button';
import Avatar from './Avatar';

/**
 * HeaderEditor component avec style neobrutalist
 * Header pour l'éditeur avec logo court et groupe de boutons
 *
 * @param {Object} props
 * @param {string} props.playTitle - Titre de la pièce à afficher dans le logo
 * @param {Object} props.user - Informations de l'utilisateur pour l'avatar
 * @param {string} props.user.name - Nom de l'utilisateur
 * @param {string} props.user.email - Email de l'utilisateur
 * @param {string} [props.user.avatar] - URL de l'avatar (optionnel)
 * @param {Array} [props.menuItems] - Items du menu dropdown de l'avatar
 * @param {Function} [props.onSettings] - Callback pour le bouton Paramètres
 * @param {Function} [props.onStats] - Callback pour le bouton Stats
 * @param {React.ReactNode} [props.settingsIcon] - Icône pour le bouton Paramètres
 * @param {React.ReactNode} [props.statsIcon] - Icône pour le bouton Stats
 * @param {string} [props.className] - Classes CSS additionnelles
 * @returns {JSX.Element}
 *
 * @example
 * <HeaderEditor
 *   playTitle="Hamlet"
 *   user={{
 *     name: "John Doe",
 *     email: "john@example.com"
 *   }}
 *   onSettings={() => navigate('/settings')}
 *   onStats={() => navigate('/stats')}
 *   settingsIcon={<SettingsIcon />}
 *   statsIcon={<StatsIcon />}
 *   menuItems={[
 *     { label: "Profil", onClick: () => navigate('/profile') },
 *     { label: "Déconnexion", onClick: handleLogout, variant: "danger" }
 *   ]}
 * />
 */
const HeaderEditor = ({
  playTitle,
  user,
  menuItems = [],
  onSettings,
  onStats,
  settingsIcon,
  statsIcon,
  className = '',
}) => {
  return (
    <header
      className={`
        sticky top-0
        bg-cream
        border-b-brutal border-black
        px-4 py-3
        ${className}
      `}
      style={{ zIndex: 'var(--z-sticky)' }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo à gauche */}
          <div className="flex-shrink-0">
            <Logo variant="short" playTitle={playTitle} />
          </div>

          {/* Groupe de boutons + Avatar à droite */}
          <div className="flex items-center gap-4">
            {/* ButtonGroup */}
            <div className="flex">
              {onSettings && (
                <Button
                  variant="secondary"
                  size="md"
                  grouped="left"
                  onClick={onSettings}
                  icon={settingsIcon}
                  aria-label="Paramètres"
                >
                  <span className="hidden md:inline">Paramètres</span>
                </Button>
              )}
              {onStats && (
                <Button
                  variant="secondary"
                  size="md"
                  grouped={onSettings ? 'right' : 'none'}
                  onClick={onStats}
                  icon={statsIcon}
                  aria-label="Statistiques"
                >
                  <span className="hidden md:inline">Stats</span>
                </Button>
              )}
            </div>

            {/* Avatar */}
            <Avatar user={user} menuItems={menuItems} />
          </div>
        </div>
      </div>
    </header>
  );
};

HeaderEditor.propTypes = {
  playTitle: PropTypes.string.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  }).isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      onClick: PropTypes.func,
      icon: PropTypes.node,
      variant: PropTypes.oneOf(['default', 'danger']),
      type: PropTypes.oneOf(['divider']),
    })
  ),
  onSettings: PropTypes.func,
  onStats: PropTypes.func,
  settingsIcon: PropTypes.node,
  statsIcon: PropTypes.node,
  className: PropTypes.string,
};

export default HeaderEditor;
