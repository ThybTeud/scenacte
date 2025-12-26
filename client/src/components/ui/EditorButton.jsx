/**
 * EditorButton component - Bouton spécialisé pour l'éditeur de pièce
 * @param {Object} props
 * @param {string} props.label - Texte du bouton
 * @param {string} [props.shortcut] - Raccourci clavier à afficher
 * @param {string} [props.background='bg-white'] - Classe de couleur de fond Tailwind
 * @param {string} [props.textColor='text-black'] - Couleur du texte Tailwind
 * @param {string} [props.font='normal'] - Style de font (normal, italic)
 * @param {string} [props.fontWeight='normal'] - Poids de la font (normal, bold)
 * @param {Function} [props.onClick] - Fonction de callback au clic
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export function EditorButton({
    label,
    shortcut,
    background = "bg-white",
    textColor = "text-black",
    font = "normal",
    fontWeight = "font-normal",
    onClick,
    className = "",
    ...props
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full flex items-center justify-between
                px-4 py-2 z-10 text-base
                rounded border-2 border-black
                font-mono ${font} ${fontWeight}
                ${background} ${textColor}
                transition-[background-color,transform]
                cursor-pointer
                shadow-brutal hover:shadow-brutal-hover hover:z-10 hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active
                ${className}
            `
                .trim()
                .replace(/\s+/g, " ")}
            {...props}
        >
            <span className="flex items-center">{label}</span>
            {/* Raccourcis clavier masqués pour le moment (facilite la mise en page)  */}
            {/* {shortcut && (
                <span className="flex px-2 py-1 rounded bg-gray-300 text-xs text-gray font-mono font-normal not-italic">
                    {shortcut}
                </span>
            )} */}
        </button>
    );
}
