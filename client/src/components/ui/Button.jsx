/**
 * Button component - Composant de bouton neobrutalist
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary'] - Variante du bouton
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Taille du bouton
 * @param {React.ReactNode} [props.icon] - Icône à afficher
 * @param {string} [props.shortcut] - Raccourci clavier à afficher
 * @param {'none'|'left'|'middle'|'right'} [props.grouped='none'] - Position dans un groupe de boutons
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @param {boolean} [props.disabled=false] - État désactivé
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Type du bouton
 * @param {Function} [props.onClick] - Fonction de callback au clic
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  shortcut,
  grouped = 'none',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  // Classes de base
  const baseStyles = 'inline-flex items-center justify-center font-ui font-medium border-brutal border-black transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  // Variantes de couleurs
  const variants = {
    primary: 'bg-orange text-white hover:bg-accent-hover shadow-brutal hover:shadow-brutal-hover active:shadow-brutal-active',
    secondary: 'bg-white text-black hover:bg-gray-50 shadow-brutal hover:shadow-brutal-hover active:shadow-brutal-active',
    ghost: 'bg-transparent text-black border-0 shadow-none hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-brutal hover:shadow-brutal-hover active:shadow-brutal-active',
  };

  // Tailles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  // Gestion du border-radius pour les groupes
  const groupedStyles = {
    none: 'rounded-brutal',
    left: 'rounded-l-brutal border-r-0',
    middle: 'rounded-none border-r-0',
    right: 'rounded-r-brutal',
  };

  // Effet hover/active
  const interactionStyles = variant !== 'ghost'
    ? 'hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px]'
    : '';

  // Gestion responsive
  const hasIcon = !!icon;
  const hasText = !!children;
  const hasShortcut = !!shortcut;

  // Classes responsive pour afficher/masquer éléments
  const textClasses = hasIcon && hasShortcut
    ? 'hidden md:inline'
    : hasIcon
      ? 'hidden md:inline'
      : '';

  const shortcutClasses = hasIcon && hasText
    ? 'hidden md:inline lg:inline'
    : '';

  // Si icon seul sur mobile, rendre le bouton carré
  const squareOnMobile = hasIcon && (hasText || hasShortcut)
    ? 'md:px-4 aspect-square md:aspect-auto px-2'
    : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${groupedStyles[grouped]}
        ${interactionStyles}
        ${squareOnMobile}
        ${className}
      `.trim()}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {hasText && <span className={textClasses}>{children}</span>}
      {hasShortcut && (
        <span
          className={`
            ${shortcutClasses}
            text-xs
            px-1.5
            py-0.5
            rounded
            bg-black/10
            font-mono
          `.trim()}
        >
          {shortcut}
        </span>
      )}
    </button>
  );
}

/**
 * ButtonGroup component - Groupe de boutons connectés
 * @param {Object} props
 * @param {React.ReactNode} props.children - Boutons enfants
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`inline-flex ${className}`}>
      {children}
    </div>
  );
}
