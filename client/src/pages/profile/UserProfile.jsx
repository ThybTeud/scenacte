import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usersService } from '../../services/users.service';
import HeaderGlobal from '../../components/layout/HeaderGlobal';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';

export function UserProfile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Menu items pour le HeaderGlobal
  const menuItems = [
    {
      label: 'Profil',
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Préférences',
      onClick: () => navigate('/preferences'),
    },
    {
      label: 'Déconnexion',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await usersService.getProfile();
      setProfile(response.user);
      setFormData((prev) => ({
        ...prev,
        email: response.user.email,
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement du profil');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Mot de passe actuel requis pour changer le mot de passe';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
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

    setIsSaving(true);

    const updateData = {
      email: formData.email,
    };

    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    try {
      const response = await usersService.updateProfile(updateData);
      updateUser(response.user);
      toast.success('Profil mis à jour avec succès !');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
      setErrors({ general: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Veuillez entrer votre mot de passe');
      return;
    }

    setIsDeleting(true);
    try {
      await usersService.deleteAccount(deletePassword);
      toast.success('Compte supprimé avec succès');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression du compte');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <HeaderGlobal user={user} menuItems={menuItems} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <HeaderGlobal user={user} menuItems={menuItems} />

      <main className="container-custom py-8">
        <h1 className="text-3xl font-bold font-ui text-black mb-6">Mon profil</h1>

        <div className="max-w-2xl">
          <Card className="mb-6">
            <h2 className="text-xl font-semibold font-ui text-black mb-4">
              Informations du compte
            </h2>

            {profile && (
              <div className="mb-4 text-sm text-black/70 font-ui">
                <p>
                  Nombre de pièces : <strong>{profile.playsCount || 0}</strong>
                </p>
                <p>
                  Membre depuis :{' '}
                  <strong>
                    {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
                  </strong>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isSaving}
              />

              <div className="my-6 border-t-2 border-black"></div>

              <h3 className="text-lg font-semibold font-ui text-black">
                Changer le mot de passe
              </h3>

              <Input
                label="Mot de passe actuel"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                error={errors.currentPassword}
                disabled={isSaving}
              />

              <Input
                label="Nouveau mot de passe"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                disabled={isSaving}
              />

              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                disabled={isSaving}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/plays')}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="border-2 border-red-500">
            <h2 className="text-xl font-semibold font-ui text-red-600 mb-4">
              Zone de danger
            </h2>
            <p className="text-black font-ui mb-4">
              La suppression de votre compte est irréversible. Toutes vos pièces
              seront définitivement supprimées.
            </p>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Supprimer mon compte
            </Button>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le compte"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-black font-ui">
            Cette action est <strong>irréversible</strong>. Toutes vos pièces
            et données seront définitivement supprimées.
          </p>
          <Input
            label="Entrez votre mot de passe pour confirmer"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            required
            disabled={isDeleting}
          />
        </div>
      </Modal>
    </div>
  );
}
