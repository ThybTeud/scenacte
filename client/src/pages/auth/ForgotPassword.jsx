import { useState, useEffect, useRef } from 'react';
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] = useState(false);
  const loadingIntervalRef = useRef(null);
  const cycleCountRef = useRef(0);

  // Gérer la barre de chargement avec timer de 30 secondes
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0);
      cycleCountRef.current = 0;
      setShowSlowConnectionMessage(false);

      // Animation fluide : mise à jour toutes les 100ms pour atteindre 100% en 30 secondes
      const increment = 100 / (30000 / 100); // 100% / (30s / 100ms)

      loadingIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + increment;

          // Si on atteint 100%, recommencer le cycle
          if (newProgress >= 100) {
            cycleCountRef.current += 1;

            // Afficher le message après le premier cycle complet
            if (cycleCountRef.current === 1) {
              setShowSlowConnectionMessage(true);
            }

            return 0; // Recommencer à 0%
          }

          return newProgress;
        });
      }, 100);
    } else {
      // Nettoyer quand le chargement se termine
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      setLoadingProgress(0);
      setShowSlowConnectionMessage(false);
      cycleCountRef.current = 0;
    }

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading]);

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
          <div className="bg-green-50 border-2 border-green-500 text-green-700 px-4 py-3 rounded font-ui">
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

        {/* Barre de chargement avec timer */}
        {isLoading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 border-2 border-black rounded h-2 overflow-hidden">
              <div
                className="bg-orange h-2 transition-all duration-100 ease-linear"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            {showSlowConnectionMessage && (
              <div className="bg-yellow-50 border-2 border-yellow-500 text-yellow-800 px-4 py-3 rounded text-sm font-ui">
                La connexion au serveur est plus lente que d'habitude. Tentez de recharger la page. Si l'erreur persiste, vous pouvez contacter{' '}
                <a href="mailto:scenacte@gmail.com" className="font-medium underline hover:text-orange">
                  scenacte@gmail.com
                </a>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-sm text-black font-ui">
          <Link
            to="/login"
            className="font-medium text-black hover:text-orange transition-colors underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
