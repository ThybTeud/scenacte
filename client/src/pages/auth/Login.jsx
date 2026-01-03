import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const loadingIntervalRef = useRef(null);
  const cycleCountRef = useRef(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

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
    setErrors({});
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Connexion réussie !');
      navigate('/plays');
    } catch (error) {
      toast.error(error.message || 'Échec de la connexion');
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    navigate('/plays');
  };

  return (
    <AuthLayout title="Connexion" subtitle="Bienvenue sur Scenacte">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 rounded font-ui">
            {errors.general}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={errors.email}
          disabled={isLoading}
        />

        <Input
          label="Mot de passe"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          error={errors.password}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-black font-ui font-medium hover:text-orange transition-colors underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
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

        {/* Séparateur "ou" */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm font-ui">ou</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Bouton mode invité */}
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleGuestAccess}
          disabled={isLoading}
        >
          Continuer sans compte
        </Button>

        <p className="text-center text-sm text-black font-ui">
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            className="font-medium text-black hover:text-orange transition-colors underline"
          >
            Créer un compte
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
