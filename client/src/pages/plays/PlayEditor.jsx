import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playsService } from '../../services/plays.service';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { VersionsSidebar } from '../../components/plays/VersionsSidebar';
import { CodeMirrorEditor } from '../../components/editors/CodeMirrorEditor';
import { PlayPreview } from '../../components/editors/PlayPreview';
import { useSyncScroll } from '../../hooks/useSyncScroll';
import { PlayParser, astToHTML } from '../../utils/playParser';
import { calculatePlayStatistics } from '../../utils/playStatistics';
import toast from 'react-hot-toast';

export function PlayEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [play, setPlay] = useState(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(() => {
    // Récupérer la préférence depuis localStorage (true par défaut)
    const saved = localStorage.getItem('autosaveEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const saveTimeoutRef = useRef(null);

  // Hook pour le scroll synchronisé
  const { editorScrollRef, previewScrollRef, handleEditorScroll, handlePreviewScroll } = useSyncScroll();

  // Parser pour générer le HTML
  const parser = useMemo(() => new PlayParser(), []);

  useEffect(() => {
    fetchPlay();
  }, [id]);

  /**
   * Persiste la préférence d'autosave dans localStorage
   */
  useEffect(() => {
    localStorage.setItem('autosaveEnabled', JSON.stringify(autosaveEnabled));
  }, [autosaveEnabled]);

  const fetchPlay = async () => {
    setIsLoading(true);
    try {
      const response = await playsService.getPlay(id);
      setPlay(response.play);
      setContent(response.play.rawContent || '');
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error('Erreur lors du chargement de la pièce');
      console.error(error);
      navigate('/plays');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sauvegarde le contenu de la pièce
   */
  const savePlay = useCallback(async () => {
    if (!play) return;

    setIsSaving(true);
    try {
      // Générer le HTML à partir du contenu brut
      let htmlContent = '';
      try {
        const ast = parser.parse(content);
        htmlContent = astToHTML(ast);
      } catch (parseError) {
        console.error('Erreur lors du parsing:', parseError);
        htmlContent = '';
      }

      // Calculer les statistiques
      const statistics = calculatePlayStatistics(content);

      // Préparer les données pour la sauvegarde
      const saveData = {
        title: play.title,
        subtitle: play.subtitle || null,
        rawContent: content,
        htmlContent: htmlContent,
        statistics: statistics
      };

      await playsService.savePlay(id, saveData);
      setHasUnsavedChanges(false);
      toast.success('Pièce sauvegardée');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }, [id, content, play, parser]);

  /**
   * Gère le changement de contenu dans l'éditeur
   */
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);

    // Annuler le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Sauvegarde automatique avec debounce (3 secondes) si activée
    if (autosaveEnabled) {
      saveTimeoutRef.current = setTimeout(() => {
        savePlay();
      }, 3000);
    }
  }, [savePlay, autosaveEnabled]);

  /**
   * Sauvegarde manuelle
   */
  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    savePlay();
  }, [savePlay]);

  /**
   * Cleanup du timeout lors du démontage
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
    <div className="h-screen bg-white flex flex-col overflow-hidden">
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
          {/* Indicateur de sauvegarde */}
          <div className="text-sm mr-2">
            {isSaving && <span className="text-primary-600">Sauvegarde en cours...</span>}
            {!isSaving && hasUnsavedChanges && <span className="text-gray-500">Modifications non sauvegardées</span>}
            {!isSaving && !hasUnsavedChanges && content && <span className="text-green-600">Sauvegardé</span>}
          </div>

          {/* Toggle autosave */}
          <div className="flex items-center space-x-2 mr-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
            <label htmlFor="autosave-toggle" className="text-xs font-medium text-gray-700 cursor-pointer">
              Autosave
            </label>
            <button
              id="autosave-toggle"
              type="button"
              role="switch"
              aria-checked={autosaveEnabled}
              onClick={() => setAutosaveEnabled(!autosaveEnabled)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                autosaveEnabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autosaveEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            {autosaveEnabled && (
              <span className="text-xs text-gray-500">(3s)</span>
            )}
          </div>

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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
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

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-64 border-r border-gray-200 p-4 bg-gray-50 overflow-y-auto">
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

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Éditeur</h3>
              <div className="text-xs text-gray-500">
                <details className="inline-block">
                  <summary className="cursor-pointer hover:text-primary-600">Syntaxe disponible</summary>
                  <div className="absolute mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg z-10 text-left w-80">
                    <ul className="space-y-2 text-xs">
                      <li><code className="bg-gray-100 px-1 rounded">#Acte 1</code> - Marqueur d'acte</li>
                      <li><code className="bg-gray-100 px-1 rounded">##Scène 1</code> - Marqueur de scène</li>
                      <li><code className="bg-gray-100 px-1 rounded">@PERSONNAGE</code> - Marqueur de personnage</li>
                      <li><code className="bg-gray-100 px-1 rounded">(didascalie)</code> - Indication scénique (autoclose)</li>
                      <li><code className="bg-gray-100 px-1 rounded">Texte</code> - Dialogue après personnage</li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeMirrorEditor
                value={content}
                onChange={handleContentChange}
                onScroll={handleEditorScroll}
                scrollSync={editorScrollRef}
              />
            </div>
          </div>
        </div>

        <div className="w-96 border-l border-gray-200 p-4 bg-gray-50 overflow-hidden flex flex-col min-w-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview HTML</h3>
          <div className="flex-1 overflow-hidden min-h-0">
            <PlayPreview
              content={content}
              onScroll={handlePreviewScroll}
              scrollSync={previewScrollRef}
            />
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
