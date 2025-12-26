/**
 * Card component - Composant de carte neobrutalist
 * @param {Object} props
 * @param {string|React.ReactNode} [props.header] - En-tête de la carte (texte ou composant)
 * @param {React.ReactNode} props.children - Contenu de la carte
 * @param {string} [props.size="md"] - Taille de la carte (md, lg)
 * @param {string} [props.heightMax="max-h-full"] - Hauteur maximale de la carte
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export function Card({
    header,
    children,
    size = "sm",
    heightMax = "flex-1",
    className = "",
}) {
    const roundedClass = size === "sm" ? "rounded-sm" : "rounded-lg";

    return (
        <div
            className={`
        flex flex-col min-h-30 bg-white
        border-2
        border-black
        shadow-brutal
        ${heightMax}
        ${roundedClass}
        ${className}
      `.trim()}
        >
            {header && (
                <div className="bg-slate-200 text-black px-4 py-3 font-ui font-semibold uppercase border-b-2 border-black">
                    {typeof header === "string" ? <h4>{header}</h4> : header}
                </div>
            )}
            <div className="px-2 py-2 pb-4 overflow-y-auto flex-1 min-h-0">
                {children}
            </div>
        </div>
    );
}
