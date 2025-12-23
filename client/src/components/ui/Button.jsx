/**
 * Button component - Composant de bouton neobrutalist
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary'] - Variante du bouton
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Taille du bouton
 * @param {boolean} [props.square=false] - Bouton carré (padding égal)
 * @param {boolean} [props.fullWidth=false] - Bouton pleine largeur
 * @param {boolean} [props.disabled=false] - État désactivé
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Type du bouton
 * @param {Function} [props.onClick] - Fonction de callback au clic
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export function Button({
    children,
    variant = "primary",
    size = "md",
    square = false,
    fullWidth = false,
    disabled = false,
    type = "button",
    onClick,
    className = "",
    ...props
}) {
    // Classes de base
    const baseStyles =
        "inline-flex items-center justify-center font-ui font-medium border-2 border-black transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Variantes de couleurs
    const variants = {
        primary: "bg-orange text-white hover:bg-orange/90 shadow-brutal",
        secondary: "bg-white text-black hover:bg-gray-50 shadow-brutal",
        ghost: "bg-white text-black hover:bg-gray-100 shadow-none",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-brutal",
    };

    // Tailles
    const sizes = {
        sm: square ? "p-1.5 text-sm" : "px-3 py-1.5 text-sm gap-1.5",
        md: square ? "p-2 text-base" : "px-4 py-2 text-base gap-2",
        lg: square ? "p-3 text-lg" : "px-6 py-3 text-lg gap-2.5",
    };

    // Effet hover/active (sauf ghost)
    const interactionStyles =
        variant !== "ghost"
            ? "hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px]"
            : "";

    // Largeur
    const widthStyles = fullWidth ? "w-full" : "";

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${interactionStyles} ${widthStyles} rounded ${className}`.trim().replace(/\s+/g, ' ')}
            {...props}
        >
            {children}
        </button>
    );
}

/**
 * ButtonGroup component - Groupe de boutons connectés
 * @param {Object} props
 * @param {React.ReactNode} props.children - Boutons enfants
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export function ButtonGroup({ children, className = "" }) {
    return (
        <div className={`inline-flex [&>button]:rounded-none [&>button:first-child]:rounded-l [&>button:last-child]:rounded-r [&>button:not(:last-child)]:border-r-0 ${className}`}>
            {children}
        </div>
    );
}
