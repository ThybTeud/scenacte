import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    // Au moins 3 caractères, lettres, chiffres, tirets et underscores uniquement
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'medium';
  };

  const validate = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!validateUsername(formData.username)) {
      newErrors.username = 'Nom d\'utilisateur invalide (3-20 caractères, lettres, chiffres, - et _ uniquement)';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.username, formData.password);
      toast.success('Compte créé avec succès !');
      navigate('/plays');
    } catch (error) {
      toast.error(error.message || 'Échec de la création du compte');
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <AuthLayout title="Créer un compte" subtitle="Commencez à écrire votre pièce">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}

        {/* Critères de validation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Critères de validation</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Email :</strong> Format valide (exemple@domaine.com)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Nom d'utilisateur :</strong> 3-20 caractères, lettres, chiffres, tirets (-) et underscores (_) uniquement</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Mot de passe :</strong> Minimum 6 caractères (recommandé : 8+ avec majuscules et chiffres)</span>
            </li>
          </ul>
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={errors.email}
          disabled={isLoading}
          placeholder="exemple@domaine.com"
        />

        <Input
          label="Nom d'utilisateur"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={errors.username}
          disabled={isLoading}
          placeholder="mon_username"
        />

        <div>
          <Input
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={errors.password}
            disabled={isLoading}
          />
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength === 'weak'
                        ? 'w-1/3 bg-red-500'
                        : passwordStrength === 'medium'
                        ? 'w-2/3 bg-yellow-500'
                        : 'w-full bg-green-500'
                    }`}
                  />
                </div>
                <span className="text-xs font-medium">
                  {passwordStrength === 'weak' && <span className="text-red-600">Faible</span>}
                  {passwordStrength === 'medium' && <span className="text-yellow-600">Moyen</span>}
                  {passwordStrength === 'strong' && <span className="text-green-600">Fort</span>}
                </span>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirmer le mot de passe"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={errors.confirmPassword}
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Création...' : 'Créer mon compte'}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-600"
          >
            Se connecter
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
