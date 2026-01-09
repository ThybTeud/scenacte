/**
 * Button component - Composant de bouton neobrutalist
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'custom'} [props.variant='primary'] - Variante du bouton
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
        "inline-flex items-center z-10 rounded justify-center font-ui font-medium border-2 border-black transition-[background-color,transform] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-[4px] disabled:translate-y-[4px]";

    // Variantes de couleurs
    const variants = {
        primary:
            "bg-orange text-white enabled:hover:bg-orange/90 enabled:shadow-brutal",
        secondary:
            "bg-white text-black enabled:hover:bg-gray-50 enabled:shadow-brutal",
        ghost: "bg-white text-black enabled:hover:bg-gray-100 shadow-none",
        danger: "bg-red-500 text-white enabled:hover:bg-red-600 enabled:shadow-brutal",
        custom: "text-white", // Pas de background par défaut, à définir via className
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
            ? "enabled:hover:z-10 enabled:hover:-translate-x-[2px] enabled:hover:-translate-y-[2px] enabled:hover:shadow-brutal-hover enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] enabled:active:shadow-brutal-active"
            : "";

    // Largeur
    const widthStyles = fullWidth ? "w-full" : "";

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${interactionStyles} ${widthStyles} ${className}`
                .trim()
                .replace(/\s+/g, " ")}
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
        <div
            className={`inline-flex [&>button]:rounded-none [&>button:first-child]:rounded-l [&>button:last-child]:rounded-r [&>button:not(:last-child)]:border-r-1 [&>button:not(:first-child)]:border-l-1 ${className}`}
        >
            {children}
        </div>
    );
}
