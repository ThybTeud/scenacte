import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storage.service';
import { useAuth } from '../../hooks/useAuth';
import HeaderGlobal from '../../components/layout/HeaderGlobal';
import { Button } from '../../components/ui/Button';
import { CardPlays } from '../../components/ui/CardPlays';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { GuestModeBanner } from '../../components/ui/GuestModeBanner';
import toast from 'react-hot-toast';

export function PlaysList() {
  const navigate = useNavigate();
  const { user, logout, isGuest } = useAuth();
  const [plays, setPlays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalPlays: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [newPlay, setNewPlay] = useState({ title: '', subtitle: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Menu items pour le HeaderGlobal (conditionnels selon mode invité)
  const menuItems = useMemo(
    () =>
      isGuest
        ? [
            {
              label: 'Créer un compte',
              onClick: () => navigate('/register'),
            },
            {
              label: 'Se connecter',
              onClick: () => navigate('/login'),
            },
          ]
        : [
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
          ],
    [navigate, logout, isGuest]
  );

  useEffect(() => {
    fetchPlays();
  }, [pagination.page, filters]);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const fetchPlays = async () => {
    setIsLoading(true);
    try {
      const response = await storageService.listPlays({
        page: pagination.page,
        limit: 20,
        ...filters,
      });
      setPlays(response.plays);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement des pièces');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlay = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await storageService.createPlay(newPlay);
      toast.success('Pièce créée avec succès !');
      setShowCreateModal(false);
      setNewPlay({ title: '', subtitle: '' });
      navigate(`/plays/${response.play.id}`);
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlay = async () => {
    if (!selectedPlay) return;

    setIsSubmitting(true);
    try {
      await storageService.deletePlay(selectedPlay.id);
      toast.success('Pièce supprimée avec succès !');
      setShowDeleteModal(false);
      setSelectedPlay(null);
      fetchPlays();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVersionsClick = (play, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    // TODO: Navigate to versions page or open versions modal
    toast('Fonctionnalité Versions à venir', { icon: 'ℹ️' });
  };

  const handleDeleteClick = (play, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setSelectedPlay(play);
    setShowDeleteModal(true);
  };

  const toggleMenu = (playId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === playId ? null : playId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-yellow-100 border-2 border-yellow-500 text-yellow-800',
      completed: 'bg-green-100 border-2 border-green-500 text-green-800',
      archived: 'bg-gray-100 border-2 border-gray-500 text-gray-800',
    };

    const labels = {
      draft: 'Brouillon',
      completed: 'Terminé',
      archived: 'Archivé',
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium font-ui ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      <HeaderGlobal user={user} menuItems={menuItems} />

      <main className="container-custom py-8">
        {isGuest && <GuestModeBanner />}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold font-ui text-black">Mes pièces</h1>
          <Button onClick={() => setShowCreateModal(true)}>
            Créer une pièce
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium font-ui text-black mb-2">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="border-2 border-black rounded px-3 py-2 font-ui bg-white focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
            >
              <option value="">Tous</option>
              <option value="draft">Brouillon</option>
              <option value="completed">Terminé</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium font-ui text-black mb-2">
              Trier par
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="border-2 border-black rounded px-3 py-2 font-ui bg-white focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
            >
              <option value="updated_at">Dernière modification</option>
              <option value="created_at">Date de création</option>
              <option value="title">Titre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium font-ui text-black mb-2">
              Ordre
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
              className="border-2 border-black rounded px-3 py-2 font-ui bg-white focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : plays.length === 0 ? (
          <CardPlays className="text-center py-12">
            <p className="text-black font-ui mb-4">Aucune pièce trouvée</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Créer votre première pièce
            </Button>
          </CardPlays>
        ) : (
          <>
            <div className="grid gap-4">
              {plays.map((play) => (
                <CardPlays
                  key={play.id}
                  hover
                  onClick={() => navigate(`/plays/${play.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold font-ui text-black">
                          {play.title}
                        </h3>
                        {getStatusBadge(play.status)}
                      </div>
                      {play.subtitle && (
                        <p className="text-black/70 font-ui mb-3">{play.subtitle}</p>
                      )}
                      <p className="text-sm text-black/60 font-ui">
                        Dernière modification : {formatDate(play.updatedAt)}
                      </p>
                    </div>
                    <div className="relative" ref={openMenuId === play.id ? menuRef : null}>
                      <button
                        onClick={(e) => toggleMenu(play.id, e)}
                        className="p-2 text-black hover:text-orange hover:bg-orange/10 rounded transition-colors border-2 border-transparent hover:border-black"
                        aria-label="Actions"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === play.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-brutal border-2 border-black py-1 z-10">
                          <button
                            onClick={(e) => handleVersionsClick(play, e)}
                            className="w-full text-left px-4 py-2 text-sm font-ui text-black hover:bg-orange/10 transition-colors"
                          >
                            Versions
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(play, e)}
                            className="w-full text-left px-4 py-2 text-sm font-ui text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Supprimer la pièce
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardPlays>
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
            />
          </>
        )}
      </main>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer une nouvelle pièce"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button onClick={handleCreatePlay} disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreatePlay} className="space-y-4">
          <Input
            label="Titre"
            value={newPlay.title}
            onChange={(e) =>
              setNewPlay((prev) => ({ ...prev, title: e.target.value }))
            }
            required
            disabled={isSubmitting}
          />
          <Input
            label="Sous-titre (optionnel)"
            value={newPlay.subtitle}
            onChange={(e) =>
              setNewPlay((prev) => ({ ...prev, subtitle: e.target.value }))
            }
            disabled={isSubmitting}
          />
        </form>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePlay}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        }
      >
        <p className="text-black font-ui">
          Êtes-vous sûr de vouloir supprimer la pièce{' '}
          <strong>{selectedPlay?.title}</strong> ? Cette action est
          irréversible.
        </p>
      </Modal>
    </div>
  );
}
