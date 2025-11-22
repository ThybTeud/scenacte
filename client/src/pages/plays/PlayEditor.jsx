import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playsService } from '../../services/plays.service';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { VersionsSidebar } from '../../components/plays/VersionsSidebar';
import { CodeMirrorEditor } from '../../components/editors/CodeMirrorEditor';
import { PlayPreview } from '../../components/editors/PlayPreview';
import { LeftPanel } from '../../components/editors/LeftPanel';
import { RightPanel } from '../../components/editors/RightPanel';
import { useSyncScroll } from '../../hooks/useSyncScroll';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { PlayParser, astToHTML, extractStructure } from '../../utils/playParser';
import { calculatePlayStatistics } from '../../utils/playStatistics';
import toast from 'react-hot-toast';

export function PlayEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [play, setPlay] = useState(null);
  const [content, setContent] = useState('');
  const [debouncedContent, setDebouncedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const saveTimeoutRef = useRef(null);

  // États pour le responsive
  const [showPreview, setShowPreview] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(false); // Masqué par défaut sur mobile
  const [showRightPanel, setShowRightPanel] = useState(false); // Masqué par défaut sur mobile
  const parseTimeoutRef = useRef(null);
  const [isParsing, setIsParsing] = useState(false);



  // Référence à l'éditeur CodeMirror pour l'insertion de texte
  const editorRef = useRef(null);

  // Hook pour le scroll synchronisé
  const { editorScrollRef, previewScrollRef, handleEditorScroll, handlePreviewScroll } = useSyncScroll();

  // Parser pour générer le HTML
  const parser = useMemo(() => new PlayParser(), []);

  useEffect(() => {
    fetchPlay();
  }, [id]);

  const fetchPlay = async () => {
    setIsLoading(true);
    try {
      const response = await playsService.getPlay(id);
      setPlay(response.play);
      const rawContent = response.play.rawContent || '';
    setContent(rawContent);
    setDebouncedContent(rawContent);
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

    setIsParsing(true);
  
    // Clear le timer précédent
    if (parseTimeoutRef.current) {
      clearTimeout(parseTimeoutRef.current);
    }
    // Nouveau timer pour déclencher le re-parsing
    parseTimeoutRef.current = setTimeout(() => {
      setDebouncedContent(newContent); // ← Mise à jour débounced
      setIsParsing(false);
    }, 300); // 300ms de debounce
  }, []);

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
      if (parseTimeoutRef.current) {
      clearTimeout(parseTimeoutRef.current);
    }
    };
  }, []);

  /**
   * Extraire la structure (actes, scènes, personnages) du contenu
   */
  const structure = useMemo(() => {
    if (!debouncedContent) return { actes: [], scenes: [], personnages: [] };

    try {
      const ast = parser.parse(debouncedContent);
      return extractStructure(ast);
    } catch (error) {
      console.error('Erreur lors de l\'extraction de la structure:', error);
      return { actes: [], scenes: [], personnages: [] };
    }
  }, [debouncedContent, parser]);

  /**
   * Calculer les statistiques
   */
  const statistics = useMemo(() => {
    if (!debouncedContent) return null;

    try {
      return calculatePlayStatistics(debouncedContent);
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return null;
    }
  }, [debouncedContent]);

  

  /**
   * Toggle un format de ligne dans l'éditeur
   */
  const toggleFormat = useCallback((formatId) => {
    if (!editorRef.current || !editorRef.current.toggleLineFormat) return;

    // Mapper les IDs des boutons vers les types de format
    const formatTypeMap = {
      acte: 'heading',
      scene: 'heading',
      personnage: 'personnage',
      didascalie: 'didascalie',
      dialogue: 'dialogue',
    };

    const formatType = formatTypeMap[formatId];
    if (formatType) {
      editorRef.current.toggleLineFormat(formatType);
    }
  }, []);

  /**
   * Insérer un nom de personnage dans l'éditeur
   */
  const insertCharacter = useCallback((characterName) => {
    if (!editorRef.current) return;
    editorRef.current.insertText(`@${characterName}\n`);
  }, []);

  /**
   * Naviguer vers une section dans l'éditeur
   */
  const navigateToSection = useCallback((position) => {
    if (!editorRef.current || !position) return;

    // Utiliser la fonction de scroll de l'éditeur
    if (editorScrollRef.current && editorScrollRef.current.scrollToLine) {
      editorScrollRef.current.scrollToLine(position.start);
    }
  }, [editorScrollRef]);

  /**
   * Télécharger le contenu brut
   */
  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${play?.title || 'piece'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Fichier téléchargé');
  }, [content, play]);

  /**
   * Hook pour les raccourcis clavier
   */
  useKeyboardShortcuts({
    onToggleFormat: toggleFormat,
  });

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

      {/* Header avec titre et boutons de navigation */}
      <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Bouton hamburger pour mobile */}
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{play.title}</h1>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Indicateur de sauvegarde (visible sur desktop) */}
        <div className="hidden md:block text-sm mt-2">
          {isParsing && <span className="text-blue-600">Analyse en cours...</span>}
          {isSaving && <span className="text-primary-600">Sauvegarde en cours...</span>}
          {!isSaving && hasUnsavedChanges && <span className="text-gray-500">Modifications non sauvegardées</span>}
          {!isSaving && !hasUnsavedChanges && content && <span className="text-green-600">Sauvegardé</span>}
        </div>
      </div>

      {/* Layout principal : 3 colonnes */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Panneau gauche - Desktop: visible, Mobile/Tablet: overlay */}
        <div className={`
          ${showLeftPanel ? 'fixed inset-0 z-40 lg:relative lg:z-auto' : 'hidden'}
          lg:block lg:w-72 xl:w-80
        `}>
          {/* Overlay backdrop (mobile/tablet) */}
          {showLeftPanel && (
            <div
              className="absolute inset-0 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setShowLeftPanel(false)}
            />
          )}

          {/* Panneau */}
          <div className={`
            relative lg:relative h-full w-72 xl:w-80 bg-white lg:bg-transparent
            ${showLeftPanel ? 'shadow-xl' : ''}
          `}>
            {/* Bouton fermer (mobile/tablet) */}
            <button
              onClick={() => setShowLeftPanel(false)}
              className="lg:hidden absolute top-4 right-4 z-10 p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <LeftPanel
              onUndo={() => {}} // TODO: Implémenter avec CodeMirror history
              onRedo={() => {}} // TODO: Implémenter avec CodeMirror history
              onSave={handleManualSave}
              onDownload={handleDownload}
              onTogglePreview={() => setShowPreview(!showPreview)}
              onToggleFormat={toggleFormat}
              onInsertCharacter={insertCharacter}
              characters={structure.personnages || []}
              canUndo={false}
              canRedo={false}
              showPreview={showPreview}
              isSaving={isSaving}
            />
          </div>
        </div>

        {/* Zone centrale : Éditeur + Preview */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          {/* Éditeur CodeMirror */}
          <div className={`
            ${showPreview ? 'flex-1' : 'w-full'}
            flex flex-col overflow-hidden min-w-0
          `}>
            <div className="flex-1 p-3 md:p-6 overflow-hidden flex flex-col min-h-0">
              {/* Mobile: Indicateur de sauvegarde + bouton sommaire */}
              <div className="md:hidden flex items-center justify-between mb-2">
                <div className="text-xs">
                  {isParsing && <span className="text-blue-600">Analyse...</span>}
                  {isSaving && <span className="text-primary-600">Sauvegarde...</span>}
                  {!isSaving && hasUnsavedChanges && <span className="text-gray-500">Non sauvegardé</span>}
                  {!isSaving && !hasUnsavedChanges && content && <span className="text-green-600">✓</span>}
                </div>
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="lg:hidden px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Sommaire
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <CodeMirrorEditor
                  ref={editorRef}
                  value={content}
                  onChange={handleContentChange}
                  onScroll={handleEditorScroll}
                  scrollSync={editorScrollRef}
                  characters={structure.personnages || []}
                />
              </div>
            </div>
          </div>

          {/* Preview - Desktop: visible, Mobile: caché ou toggle */}
          {showPreview && (
            <div className="hidden lg:block lg:flex-1 border-l border-gray-200 overflow-hidden">
              <div className="h-full p-4 bg-gray-50 p-3 md:p-6 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-hidden min-h-0">
                  <PlayPreview
                    content={debouncedContent}
                    onScroll={handlePreviewScroll}
                    scrollSync={previewScrollRef}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panneau droit - Desktop: visible, Mobile/Tablet: overlay */}
        <div className={`
          ${showRightPanel ? 'fixed inset-y-0 right-0 z-40 lg:relative lg:z-auto' : 'hidden'}
          lg:block lg:w-72 xl:w-80
        `}>
          {/* Overlay backdrop (mobile/tablet) */}
          {showRightPanel && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setShowRightPanel(false)}
            />
          )}

          {/* Panneau */}
          <div className={`
            relative h-full w-72 xl:w-80 bg-white lg:bg-transparent
            ${showRightPanel ? 'shadow-xl' : ''}
          `}>
            {/* Bouton fermer (mobile/tablet) */}
            <button
              onClick={() => setShowRightPanel(false)}
              className="lg:hidden absolute top-4 right-4 z-10 p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <RightPanel
              structure={structure}
              statistics={statistics}
              onNavigateToSection={navigateToSection}
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
