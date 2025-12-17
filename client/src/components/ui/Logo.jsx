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
      <div className={`flex items-center font-ui font-bold text-2xl gap-4 space-between${className}`}>
        <img src="/logo_short.png" alt="Scenacte Logo" className="h-10 w-auto" />
        <div className="border-2 rounded px-2">
          <span className="text-black">{playTitle || 'Titre'}</span>
        </div>
        
      </div>
    );
  }

  // Variant 'full' par défaut
  return (
    <div className={`flex items-center font-ui font-bold text-2xl ${className}`}>
      <img src="/logo_long.png" alt="Scenacte Logo" className="h-10 w-auto" />
    </div>
  );
}
