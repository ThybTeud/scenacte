import { Dropdown, DropdownItem } from './Dropdown';

/**
 * Avatar component - Composant d'avatar avec dropdown menu neobrutalist
 * @param {Object} props
 * @param {Object} props.user - Objet utilisateur
 * @param {string} props.user.email - Email de l'utilisateur
 * @param {string} [props.user.avatar] - URL de l'avatar
 * @param {Array<Object>} props.menuItems - Items du menu dropdown
 * @param {string} props.menuItems[].label - Label de l'item
 * @param {React.ReactNode} [props.menuItems[].icon] - Icône de l'item
 * @param {Function} props.menuItems[].onClick - Fonction callback au clic
 * @param {boolean} [props.menuItems[].divider] - Affiche un séparateur avant cet item
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export default function Avatar({ user, menuItems = [], className = '' }) {
  // Obtenir les initiales depuis l'email
  const getInitials = (email) => {
    if (!email) return '?';
    return email[0].toUpperCase();
  };

  const initials = getInitials(user?.email);

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
                border-slate-900
                bg-blue-600             
                flex items-center justify-center
                font-ui font-bold
                text-white
                transition-transform
                cursor-pointer
              "
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.email}
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
            {item.divider && <div className="border-t-2 border-slate-900 my-1" />}
            <DropdownItem onClick={item.onClick} icon={item.icon}>
              {item.label}
            </DropdownItem>
          </div>
        ))}
      </Dropdown>
    </div>
  );
}
