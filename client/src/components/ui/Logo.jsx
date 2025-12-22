/**
 * Logo component - Composant de logo neobrutalist pour Scenacte
 * @param {Object} props
 * @param {'full'|'short'} [props.variant='full'] - Variante du logo ('full' pour "#Scenacte", 'short' pour "#[titre]")
 * @param {string} [props.playTitle] - Titre de la pièce pour la variante 'short'
 */
export default function Logo({ variant = 'full'}) {
  if (variant === 'short') {
    return (
      <div className="flex items-center font-ui font-bold text-2xl gap-4 space-between">
        <img src="/logo_short.png" alt="Scenacte Logo" className="h-10 w-auto" />
      </div>
    );
  }

  // Variant 'full' par défaut
  return (
    <div className="flex items-center font-ui font-bold text-2xl">
      <img src="/logo_long.png" alt="Scenacte Logo" className="h-10 w-auto" />
    </div>
  );
}
