import { Dropdown, DropdownItem } from './Dropdown';

/**
 * Avatar component - Composant d'avatar avec dropdown menu neobrutalist
 * @param {Object} props
 * @param {Object} props.user - Objet utilisateur
 * @param {string} props.user.name - Nom de l'utilisateur
 * @param {string} [props.user.email] - Email de l'utilisateur
 * @param {string} [props.user.avatar] - URL de l'avatar
 * @param {Array<Object>} props.menuItems - Items du menu dropdown
 * @param {string} props.menuItems[].label - Label de l'item
 * @param {React.ReactNode} [props.menuItems[].icon] - Icône de l'item
 * @param {Function} props.menuItems[].onClick - Fonction callback au clic
 * @param {boolean} [props.menuItems[].divider] - Affiche un séparateur avant cet item
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export default function Avatar({ user, menuItems = [], className = '' }) {
  // Obtenir les initiales
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const initials = getInitials(user?.name || user?.username);

  return (
    <div className={className}>
      <Dropdown
        trigger={
          <button className="flex items-center space-x-2 focus:outline-none group">
            <div
              className="
                w-10 h-10
                rounded-full
                border-2
                border-black
                bg-orange-500                
                flex items-center justify-center
                font-ui font-bold
                text-s
                transition-transform
                cursor-pointer
              "
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            
          </button>
        }
      >
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.divider && <div className="border-t-2 border-black my-1" />}
            <DropdownItem onClick={item.onClick} icon={item.icon}>
              {item.label}
            </DropdownItem>
          </div>
        ))}
      </Dropdown>
    </div>
  );
}
