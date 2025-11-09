import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Email envoyé">
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
            Veuillez vérifier votre boîte de réception.
          </div>
          <Link to="/login">
            <Button variant="primary" className="w-full">
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Envoi...' : 'Envoyer le lien'}
        </Button>

        <p className="text-center text-sm text-gray-600">
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-600"
          >
            Retour à la connexion
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
