import PropTypes from 'prop-types';
import { forwardRef } from 'react';

/**
 * Button component avec style neobrutalist
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'ghost'} [props.variant='primary'] - Variante du bouton
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Taille du bouton
 * @param {React.ReactNode} [props.icon] - Icône à afficher
 * @param {string} [props.shortcut] - Raccourci clavier à afficher (ex: "⌘K")
 * @param {'none' | 'left' | 'middle' | 'right'} [props.grouped='none'] - Position dans un groupe de boutons
 * @param {boolean} [props.disabled=false] - Désactiver le bouton
 * @param {string} [props.type='button'] - Type HTML du bouton
 * @param {Function} [props.onClick] - Callback au clic
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @param {string} [props.className] - Classes CSS additionnelles
 * @returns {JSX.Element}
 *
 * @example
 * // Bouton primaire simple
 * <Button>Enregistrer</Button>
 *
 * @example
 * // Bouton avec icône et raccourci
 * <Button icon={<SaveIcon />} shortcut="⌘S">Enregistrer</Button>
 *
 * @example
 * // Groupe de boutons
 * <div className="flex">
 *   <Button grouped="left">Premier</Button>
 *   <Button grouped="middle">Milieu</Button>
 *   <Button grouped="right">Dernier</Button>
 * </div>
 */
const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      shortcut,
      grouped = 'none',
      disabled = false,
      type = 'button',
      onClick,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    // Styles de base neobrutalist
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-ui font-semibold
      border-brutal border-black
      rounded-brutal
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
      disabled:opacity-50 disabled:cursor-not-allowed
      hover:translate-x-[-2px] hover:translate-y-[-2px]
      active:translate-x-[2px] active:translate-y-[2px]
    `;

    // Variantes de couleur
    const variants = {
      primary: `
        bg-orange text-white
        shadow-brutal
        hover:shadow-brutal-lg hover:bg-accent-hover
        active:shadow-brutal-active
      `,
      secondary: `
        bg-white text-black
        shadow-brutal
        hover:shadow-brutal-lg hover:bg-cream
        active:shadow-brutal-active
      `,
      ghost: `
        bg-transparent text-black
        border-transparent
        hover:bg-cream hover:border-black
        shadow-none
        active:shadow-none
      `,
    };

    // Tailles
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    // Gestion des radius pour les boutons groupés
    const groupedStyles = {
      none: 'rounded-brutal',
      left: 'rounded-l-brutal rounded-r-none border-r-0',
      middle: 'rounded-none border-r-0',
      right: 'rounded-r-brutal rounded-l-none',
    };

    // Gestion de l'affichage responsive
    const hasIcon = !!icon;
    const hasText = !!children;
    const hasShortcut = !!shortcut;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${groupedStyles[grouped]}
          ${className}
        `}
        {...props}
      >
        {/* Icône - toujours visible */}
        {hasIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Texte - caché sur mobile si icône présente */}
        {hasText && (
          <span
            className={hasIcon && hasShortcut ? 'hidden md:inline lg:inline' : ''}
          >
            {children}
          </span>
        )}

        {/* Raccourci - caché sur mobile, visible sur tablet+ si icône présente */}
        {hasShortcut && (
          <span
            className={`
              text-xs opacity-70 px-1.5 py-0.5 rounded bg-black/10
              ${hasIcon ? 'hidden md:inline' : ''}
            `}
            aria-label={`Raccourci: ${shortcut}`}
          >
            {shortcut}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.node,
  shortcut: PropTypes.string,
  grouped: PropTypes.oneOf(['none', 'left', 'middle', 'right']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Button;
