import PropTypes from 'prop-types';
import Logo from './Logo';
import Avatar from './Avatar';

/**
 * HeaderGlobal component avec style neobrutalist
 * Header global de l'application avec logo complet et avatar
 *
 * @param {Object} props
 * @param {Object} props.user - Informations de l'utilisateur pour l'avatar
 * @param {string} props.user.name - Nom de l'utilisateur
 * @param {string} props.user.email - Email de l'utilisateur
 * @param {string} [props.user.avatar] - URL de l'avatar (optionnel)
 * @param {Array} [props.menuItems] - Items du menu dropdown de l'avatar
 * @param {string} [props.className] - Classes CSS additionnelles
 * @returns {JSX.Element}
 *
 * @example
 * <HeaderGlobal
 *   user={{
 *     name: "John Doe",
 *     email: "john@example.com"
 *   }}
 *   menuItems={[
 *     { label: "Profil", onClick: () => navigate('/profile') },
 *     { label: "Paramètres", onClick: () => navigate('/settings') },
 *     { type: "divider" },
 *     { label: "Déconnexion", onClick: handleLogout, variant: "danger" }
 *   ]}
 * />
 */
const HeaderGlobal = ({ user, menuItems = [], className = '' }) => {
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
            <Logo variant="full" />
          </div>

          {/* Avatar à droite */}
          <div className="flex items-center">
            <Avatar user={user} menuItems={menuItems} />
          </div>
        </div>
      </div>
    </header>
  );
};

HeaderGlobal.propTypes = {
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
  className: PropTypes.string,
};

export default HeaderGlobal;
