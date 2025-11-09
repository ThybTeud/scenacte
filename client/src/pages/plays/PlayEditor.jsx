import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playsService } from '../../services/plays.service';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { VersionsSidebar } from '../../components/plays/VersionsSidebar';
import toast from 'react-hot-toast';

export function PlayEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [play, setPlay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    fetchPlay();
  }, [id]);

  const fetchPlay = async () => {
    setIsLoading(true);
    try {
      const response = await playsService.getPlay(id);
      setPlay(response.play);
    } catch (error) {
      toast.error('Erreur lors du chargement de la pièce');
      console.error(error);
      navigate('/plays');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader />
        </div>
      </div>
    );
  }

  if (!play) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{play.title}</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/plays')}>
              Retour
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersions(true)}
            >
              Versions
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" disabled>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Annuler
          </Button>
          <Button variant="ghost" size="sm" disabled>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
            Rétablir
          </Button>
          <Button variant="ghost" size="sm" disabled>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Sauvegarder
          </Button>
          <Button variant="ghost" size="sm" disabled>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Navigation</h3>
          <div className="text-sm text-gray-500 space-y-2">
            <p className="italic">Fonctionnalité à venir :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Liste des actes</li>
              <li>Liste des scènes</li>
              <li>Filtrage par personnage</li>
            </ul>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Éditeur</h3>
            <div className="h-full border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <p className="text-gray-500 text-center">
                Zone d'édition - À implémenter
              </p>
              <p className="text-gray-400 text-sm text-center mt-2">
                Textarea simple ou éditeur de texte riche
              </p>
              {play.raw_content && (
                <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {play.raw_content}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-96 border-l border-gray-200 p-4 bg-gray-50 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview HTML</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <p className="text-gray-500 text-center">
              Preview HTML - À implémenter
            </p>
            <p className="text-gray-400 text-sm text-center mt-2">
              Affichage du rendu HTML en temps réel
            </p>
          </div>
        </div>
      </div>

      <VersionsSidebar
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
        playId={id}
        onRestore={fetchPlay}
      />
    </div>
  );
}
