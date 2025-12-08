import PropTypes from 'prop-types';

/**
 * Card component avec style neobrutalist
 *
 * @param {Object} props
 * @param {string | React.ReactNode} [props.header] - En-tête de la carte (optionnel)
 * @param {React.ReactNode} props.children - Contenu de la carte
 * @param {string} [props.className] - Classes CSS additionnelles pour le conteneur
 * @param {string} [props.bodyClassName] - Classes CSS additionnelles pour le body
 * @param {Function} [props.onClick] - Callback au clic (rend la carte cliquable)
 * @returns {JSX.Element}
 *
 * @example
 * // Card simple sans header
 * <Card>
 *   <p>Contenu de la carte</p>
 * </Card>
 *
 * @example
 * // Card avec header texte
 * <Card header="Titre de la carte">
 *   <p>Contenu de la carte</p>
 * </Card>
 *
 * @example
 * // Card avec header custom
 * <Card header={<div className="flex items-center gap-2">...</div>}>
 *   <p>Contenu de la carte</p>
 * </Card>
 */
const Card = ({ header, children, className = '', bodyClassName = '', onClick }) => {
  const isClickable = !!onClick;

  return (
    <div
      className={`
        bg-white
        border-brutal border-black
        shadow-brutal
        rounded-brutal
        overflow-hidden
        ${isClickable ? 'cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
    >
      {/* Header */}
      {header && (
        <div className="bg-violet text-white px-4 py-3 border-b-brutal border-black font-ui font-semibold">
          {typeof header === 'string' ? <h3 className="text-lg m-0">{header}</h3> : header}
        </div>
      )}

      {/* Body */}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

Card.propTypes = {
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;
