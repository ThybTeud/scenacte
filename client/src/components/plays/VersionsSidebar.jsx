import { useState, useEffect } from 'react';
import { versionsService } from '../../services/versions.service';
import { Button } from '../ui/Button';
import { Loader } from '../ui/Loader';
import { Pagination } from '../ui/Pagination';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

export function VersionsSidebar({ isOpen, onClose, playId, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && playId) {
      fetchVersions();
    }
  }, [isOpen, playId, pagination.page]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const response = await versionsService.listVersions(playId, {
        page: pagination.page,
        limit: 20,
      });
      setVersions(response.versions);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement des versions');
      // Error already handled by toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;

    setIsRestoring(true);
    try {
      await versionsService.restoreVersion(playId, selectedVersion.id);
      toast.success('Version restaurée avec succès !');
      setShowRestoreModal(false);
      setSelectedVersion(null);
      onRestore();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la restauration');
    } finally {
      setIsRestoring(false);
    }
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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Versions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="py-12">
              <Loader size={60} />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune version disponible</p>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        Version #{version.versionNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(version.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        version.versionType === 'manual'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {version.versionType === 'manual' ? 'Manuel' : 'Auto'}
                    </span>
                  </div>

                  {version.manualLabel && (
                    <p className="text-sm text-gray-700 mb-2">
                      {version.manualLabel}
                    </p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedVersion(version);
                      setShowRestoreModal(true);
                    }}
                  >
                    Restaurer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isLoading && versions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Restaurer la version"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowRestoreModal(false)}
              disabled={isRestoring}
            >
              Annuler
            </Button>
            <Button onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? 'Restauration...' : 'Restaurer'}
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Êtes-vous sûr de vouloir restaurer la version #{selectedVersion?.versionNumber} ?
          Cela remplacera le contenu actuel de la pièce.
        </p>
      </Modal>
    </>
  );
}
