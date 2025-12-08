import PropTypes from 'prop-types';

/**
 * Logo component avec style neobrutalist
 *
 * @param {Object} props
 * @param {'full' | 'short'} props.variant - Variante du logo ('full' pour "#Scenacte", 'short' pour "#[playTitle]")
 * @param {string} [props.playTitle] - Titre de la pièce (requis pour variant='short')
 * @returns {JSX.Element}
 *
 * @example
 * // Logo complet
 * <Logo variant="full" />
 *
 * @example
 * // Logo court avec titre de pièce
 * <Logo variant="short" playTitle="Hamlet" />
 */
const Logo = ({ variant = 'full', playTitle }) => {
  if (variant === 'short' && !playTitle) {
    console.warn('Logo: playTitle est requis pour variant="short"');
    return null;
  }

  const logoText = variant === 'full' ? 'Scenacte' : playTitle;

  return (
    <div className="flex items-center gap-1">
      <span
        className="font-ui font-bold text-2xl text-orange"
        style={{
          textShadow: 'var(--shadow-brutal-sm)'
        }}
      >
        #
      </span>
      <span className="font-ui font-semibold text-2xl text-black">
        {logoText}
      </span>
    </div>
  );
};

Logo.propTypes = {
  variant: PropTypes.oneOf(['full', 'short']).isRequired,
  playTitle: PropTypes.string,
};

export default Logo;
