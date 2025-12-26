import { cn } from "../../utils/cn";
import { CloseIcon } from "../icons/CloseIcon";

/**
 * Composant réutilisable pour les panneaux latéraux (gauche/droite)
 * Gère automatiquement le backdrop, l'overlay et le bouton de fermeture pour mobile
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu du panneau
 * @param {boolean} props.isOpen - État d'ouverture du panneau
 * @param {Function} props.onClose - Callback de fermeture
 * @param {"left"|"right"} props.position - Position du panneau
 * @param {string} props.className - Classes CSS additionnelles
 */
export function SidePanel({
    children,
    isOpen,
    onClose,
    position = "left",
    className,
}) {
    const isLeft = position === "left";
    const isRight = position === "right";

    return (
        <div
            className={cn(
                // Visibilité et layout
                isOpen
                    ? "fixed inset-0 z-40 lg:relative lg:z-auto"
                    : "hidden",
                "lg:block lg:w-72 xl:w-80"
            )}
        >
            {/* Backdrop (mobile/tablet uniquement) */}
            {isOpen && (
                <div
                    className={cn(
                        "absolute inset-0 bg-black lg:hidden",
                        isLeft && "bg-opacity-50",
                        isRight && "bg-opacity-50"
                    )}
                    onClick={onClose}
                />
            )}

            {/* Panneau */}
            <div
                className={cn(
                    "relative h-full w-72 xl:w-80 bg-white lg:bg-transparent",
                    isOpen && "shadow-xl",
                    isRight && "ml-auto",
                    className
                )}
            >
                {/* Bouton fermer (mobile/tablet uniquement) */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 z-10 p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    aria-label="Fermer"
                >
                    <CloseIcon />
                </button>

                {children}
            </div>
        </div>
    );
}
