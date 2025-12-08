import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import Card from './Card';

/**
 * Avatar component avec dropdown menu neobrutalist
 *
 * @param {Object} props
 * @param {Object} props.user - Informations de l'utilisateur
 * @param {string} props.user.name - Nom de l'utilisateur
 * @param {string} props.user.email - Email de l'utilisateur
 * @param {string} [props.user.avatar] - URL de l'avatar (optionnel)
 * @param {Array} [props.menuItems] - Items du menu dropdown
 * @param {string} [props.className] - Classes CSS additionnelles
 * @returns {JSX.Element}
 *
 * @example
 * <Avatar
 *   user={{ name: "John Doe", email: "john@example.com" }}
 *   menuItems={[
 *     { label: "Profil", onClick: () => {}, icon: <ProfileIcon /> },
 *     { label: "Paramètres", onClick: () => {}, icon: <SettingsIcon /> },
 *     { type: "divider" },
 *     { label: "Déconnexion", onClick: () => {}, variant: "danger" }
 *   ]}
 * />
 */
const Avatar = ({ user, menuItems = [], className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Générer les initiales à partir du nom
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMenuItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Button */}
      <button
        ref={buttonRef}
        className="
          w-10 h-10
          rounded-full
          border-brutal border-black
          bg-orange
          text-white
          font-ui font-bold text-sm
          flex items-center justify-center
          hover:scale-110
          transition-transform duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
        "
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Menu de ${user.name}`}
        aria-expanded={isOpen}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitials(user.name)}</span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-64 z-dropdown"
          style={{ zIndex: 'var(--z-dropdown)' }}
        >
          <Card className="p-0">
            {/* User Info */}
            <div className="px-4 py-3 border-b-brutal border-black bg-cream">
              <p className="font-ui font-semibold text-sm text-black m-0">
                {user.name}
              </p>
              <p className="font-ui text-xs text-black/70 m-0 mt-1">
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            {menuItems.length > 0 && (
              <div className="py-1">
                {menuItems.map((item, index) => {
                  // Divider
                  if (item.type === 'divider') {
                    return (
                      <div
                        key={`divider-${index}`}
                        className="border-t-brutal border-black my-1"
                      />
                    );
                  }

                  // Menu Item
                  const itemVariant = item.variant || 'default';
                  const variantStyles = {
                    default: 'text-black hover:bg-cream',
                    danger: 'text-red-600 hover:bg-red-50',
                  };

                  return (
                    <button
                      key={index}
                      className={`
                        w-full px-4 py-2
                        flex items-center gap-2
                        font-ui text-sm text-left
                        transition-colors duration-150
                        ${variantStyles[itemVariant]}
                      `}
                      onClick={() => handleMenuItemClick(item)}
                    >
                      {item.icon && (
                        <span className="flex-shrink-0" aria-hidden="true">
                          {item.icon}
                        </span>
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

Avatar.propTypes = {
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

export default Avatar;
