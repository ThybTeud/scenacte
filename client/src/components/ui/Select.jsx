/**
 * Select component - Composant de sélection neobrutalist
 * @param {Object} props
 * @param {string} [props.label] - Label du champ
 * @param {Array<{value: string, label: string}>} props.options - Options du select
 * @param {string} [props.value] - Valeur sélectionnée
 * @param {Function} [props.onChange] - Fonction de callback au changement
 * @param {string} [props.error] - Message d'erreur
 * @param {string} [props.id] - ID du select
 * @param {string} [props.name] - Nom du select
 * @param {boolean} [props.required=false] - Champ requis
 * @param {boolean} [props.disabled=false] - État désactivé
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  id,
  name,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const selectId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium font-ui text-black mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2
          border-2 border-black
          rounded
          text-black
          font-ui
          bg-white
          focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-black'}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-ui">{error}</p>
      )}
    </div>
  );
}
