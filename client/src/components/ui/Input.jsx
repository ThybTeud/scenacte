/**
 * Input component - Composant de champ de texte neobrutalist
 * @param {Object} props
 * @param {string} [props.label] - Label du champ
 * @param {string} [props.error] - Message d'erreur
 * @param {string} [props.type='text'] - Type de l'input
 * @param {string} [props.id] - ID de l'input
 * @param {string} [props.name] - Nom de l'input
 * @param {string} [props.value] - Valeur de l'input
 * @param {Function} [props.onChange] - Fonction de callback au changement
 * @param {string} [props.placeholder] - Texte de placeholder
 * @param {boolean} [props.required=false] - Champ requis
 * @param {boolean} [props.disabled=false] - État désactivé
 * @param {string} [props.className] - Classes CSS additionnelles
 */
export function Input({
  label,
  error,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium font-ui text-black mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2
          border-2 border-black
          rounded
          text-black placeholder-gray-400
          font-ui
          focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-black'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 font-ui">{error}</p>
      )}
    </div>
  );
}
