/**
 * Card component - Composant de carte neobrutalist
 * @param {Object} props
 * @param {string|React.ReactNode} [props.header] - En-tête de la carte (texte ou composant)
 * @param {React.ReactNode} props.children - Contenu de la carte
 * @param {string} [props.className] - Classes CSS additionnelles
 * @param {Function} [props.onClick] - Fonction de callback au clic
 * @param {boolean} [props.hover=false] - Active l'effet de hover
 */
export function Card({ children, header, className = '', onClick, hover = false }) {
  const isClickable = !!onClick || hover;

  return (
    <div
      className={`
        bg-white
        border-2
        border-black
        rounded
        shadow-brutal
        overflow-hidden
        ${isClickable ? 'cursor-pointer hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-hover transition-all' : ''}
        ${className}
      `.trim()}
      onClick={onClick}
    >
      {header && (
        <div className="bg-violet text-white px-6 py-3 font-ui font-semibold border-b-2 border-black">
          {typeof header === 'string' ? <h3 className="text-lg">{header}</h3> : header}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
