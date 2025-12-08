import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Avatar from '../ui/Avatar';

/**
 * HeaderGlobal component - En-tête global de l'application avec style neobrutalist
 * @param {Object} props
 * @param {Object} props.user - Objet utilisateur
 * @param {Array<Object>} props.menuItems - Items du menu avatar
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export default function HeaderGlobal({ user, menuItems, className = '' }) {
  return (
    <header
      className={`
        bg-cream
        border-b-brutal
        border-black
        sticky
        top-0
        z-50
        ${className}
      `.trim()}
    >
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo à gauche */}
          <Link to="/plays" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo variant="full" />
          </Link>

          {/* Avatar avec dropdown à droite */}
          <Avatar user={user} menuItems={menuItems} />
        </div>
      </div>
    </header>
  );
}
