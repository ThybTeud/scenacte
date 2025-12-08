import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!token) {
      toast.error('Token de réinitialisation manquant');
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, formData.newPassword);
      toast.success('Mot de passe réinitialisé avec succès !');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Échec de la réinitialisation');
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Erreur">
        <div className="text-center space-y-4">
          <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 rounded font-ui">
            Token de réinitialisation manquant ou invalide
          </div>
          <Link to="/forgot-password">
            <Button variant="primary" className="w-full">
              Demander un nouveau lien
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Réinitialiser le mot de passe"
      subtitle="Entrez votre nouveau mot de passe"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 rounded font-ui">
            {errors.general}
          </div>
        )}

        <Input
          label="Nouveau mot de passe"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          error={errors.newPassword}
          disabled={isLoading}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
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
          {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
        </Button>
      </form>
    </AuthLayout>
  );
}
