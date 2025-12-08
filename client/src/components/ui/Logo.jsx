/**
 * Logo component - Composant de logo neobrutalist pour Scenacte
 * @param {Object} props
 * @param {'full'|'short'} [props.variant='full'] - Variante du logo ('full' pour "#Scenacte", 'short' pour "#[titre]")
 * @param {string} [props.playTitle] - Titre de la pièce pour la variante 'short'
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export default function Logo({ variant = 'full', playTitle, className = '' }) {
  if (variant === 'short') {
    return (
      <div className={`flex items-center font-ui font-bold text-2xl ${className}`}>
        <span className="text-orange" style={{ textShadow: '2px 2px 0 #1a1a1a' }}>#</span>
        <span className="text-black">{playTitle || 'Titre'}</span>
      </div>
    );
  }

  // Variant 'full' par défaut
  return (
    <div className={`flex items-center font-ui font-bold text-2xl ${className}`}>
      <span className="text-orange" style={{ textShadow: '2px 2px 0 #1a1a1a' }}>#</span>
      <span className="text-black">Scenacte</span>
    </div>
  );
}
