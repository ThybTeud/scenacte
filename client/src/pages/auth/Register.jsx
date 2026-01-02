import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { storageService } from '../../services/storage.service';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GuestDataMigrationModal } from '../../components/ui/GuestDataMigrationModal';
import toast from 'react-hot-toast';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const loadingIntervalRef = useRef(null);
  const cycleCountRef = useRef(0);

  // États pour la migration des données invité
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [guestPlaysCount, setGuestPlaysCount] = useState(0);

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 12;
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 12) return 'medium';
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'medium';
  };

  const validate = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 12 caractères';
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
      await register(formData.email, formData.password);
      toast.success('Compte créé avec succès !');

      // Vérifier si des données invité existent
      if (storageService.hasGuestData()) {
        const guestData = storageService.getGuestData();
        setGuestPlaysCount(guestData.plays.length);
        setShowMigrationModal(true);
      } else {
        // Pas de données invité, redirection directe
        navigate('/plays');
      }
    } catch (error) {
      toast.error(error.message || 'Échec de la création du compte');
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateData = async () => {
    setShowMigrationModal(false);
    toast.loading('Migration des pièces en cours...');

    try {
      const result = await storageService.migrateGuestData();

      if (result.failed > 0) {
        toast.success(
          `${result.migrated} pièce(s) importée(s), ${result.failed} échec(s)`,
          { duration: 5000 }
        );
      } else {
        toast.success(`${result.migrated} pièce(s) importée(s) avec succès !`);
      }

      navigate('/plays');
    } catch (error) {
      toast.error('Erreur lors de la migration des données');
      console.error(error);
      navigate('/plays');
    }
  };

  const handleSkipMigration = () => {
    setShowMigrationModal(false);
    storageService.clearGuestData();
    toast('Données locales supprimées', { icon: 'ℹ️' });
    navigate('/plays');
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <AuthLayout title="Créer un compte" subtitle="Commencez à écrire votre pièce">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 rounded font-ui">
            {errors.general}
          </div>
        )}

        {/* Critères de validation */}
        <div className="bg-violet/10 border-2 border-violet rounded p-4">
          <h3 className="text-sm font-semibold font-ui text-black mb-2">Critères de validation</h3>
          <ul className="text-xs text-black font-ui space-y-1">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Email :</strong> Format valide (exemple@domaine.com)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Mot de passe :</strong> Minimum 12 caractères (recommandé : avec majuscules, chiffres et symboles)</span>
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
                <div className="flex-1 h-2 bg-gray-200 border-2 border-black rounded overflow-hidden">
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
                <span className="text-xs font-medium font-ui">
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
          Déjà un compte ?{' '}
          <Link
            to="/login"
            className="font-medium text-black hover:text-orange transition-colors underline"
          >
            Se connecter
          </Link>
        </p>
      </form>

      <GuestDataMigrationModal
        isOpen={showMigrationModal}
        onClose={handleSkipMigration}
        onMigrate={handleMigrateData}
        playsCount={guestPlaysCount}
      />
    </AuthLayout>
  );
}
