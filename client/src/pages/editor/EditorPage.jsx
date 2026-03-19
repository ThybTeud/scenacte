import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSyncScroll } from "@/hooks/useSyncScroll";
import { useVersioning } from "@/hooks/useVersioning";
import { toast } from "sonner";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { usePlayParsing } from "@/hooks/usePlayParsing";
import { PlayParser } from "@/utils/playParser";
import EditorSettingsModal from "@/components/modals/EditorSettingsModal";
import PageSettingsModal from "@/components/modals/PageSettingsModal";
import ExportModal from "@/components/modals/ExportModal";
import VersionHistoryModal from "@/components/modals/VersionHistoryModal";
import StatsModal from "@/components/modals/StatsModal";
import { getPreset } from "@/config/template-presets";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import { SyntaxBar } from "@/components/editor/SyntaxBar";

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [play, setPlay] = useState(null);
  const [lastSavedContent, setLastSavedContent] = useState("");

  // État du document
  const [content, setContent] = useState("");

  // Référence à l'éditeur CodeMirror pour l'insertion de texte
  const editorRef = useRef(null);

  const [currentLine, setCurrentLine] = useState(null);

  // Timeout de sauvegarde automatique
  const saveTimeoutRef = useRef(null);

  // Référence pour tracker le contenu précédent (versioning)
  const previousContentRef = useRef(content);

  // Référence pour le beforeunload (évite les réattachements constants du listener)
  const hasUnsavedVersionChangesRef = useRef(false);

  // Debounce pour optimiser le parsing (300ms)
  const debouncedContent = useDebouncedValue(content, 300);

  // Indicateur de parsing en cours
  const isParsing = content !== debouncedContent;

  // État UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // States modals
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [showEditorSettingsModal, setShowEditorSettingsModal] = useState(false);
  const [showPageSettingsModal, setShowPageSettingsModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Settings de mise en page
  const [paperSize, setPaperSize] = useState("A5");
  const [presetId, setPresetId] = useState('classique');

  // Preset actif pour la preview et le CSS
  const preset = useMemo(() => getPreset(presetId), [presetId]);

  // Instance du parser (créée une seule fois)
  const parser = useMemo(() => new PlayParser(), []);

  // Hook pour le scroll synchronisé
  const {
    editorScrollRef,
    previewScrollRef,
    handleEditorScroll,
    handlePreviewScroll,
  } = useSyncScroll();

  // Hook versioning
  const {
    trackChanges,
    createVersion,
    hasUnsavedChanges: hasUnsavedVersionChanges,
    charsSinceLastVersion,
  } = useVersioning(id, true);

  // Hook parsing (utilise le contenu debouncé pour optimiser les performances)
  const { structure, statistics, htmlContent } = usePlayParsing(
    debouncedContent,
    parser,
  );

  // Chargement initial de la pièce
  useEffect(() => {
    fetchPlay();
  }, [id]);

  // Auto-focus sur l'éditeur après chargement
  useEffect(() => {
    if (!isLoading && editorRef.current?.focus) {
      editorRef.current.focus();
      setCurrentLine(0);
    }
  }, [isLoading]);

  const fetchPlay = async () => {
    setIsLoading(true);
    try {
      const response = await storageService.getPlay(id);
      setPlay(response.play);
      const rawContent = response.play.rawContent || "";
      setContent(rawContent);
      setLastSavedContent(rawContent);
      setHasUnsavedChanges(false);

      // Charger les settings de mise en page
      setPaperSize(response.play.paperSize || "A5");

      // Charger le presetId depuis localStorage (en attendant la migration BDD)
      const savedPresetId = localStorage.getItem(`scenacte_preset_${id}`);
      if (savedPresetId) {
        setPresetId(savedPresetId);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement de la piece");
      navigate("/library");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sauvegarde le contenu de la pièce
   * @param {boolean} isAutoSave - Si true, la sauvegarde est automatique et silencieuse
   */
  const savePlay = useCallback(
    async (isAutoSave = false) => {
      if (!play) return;

      setIsSaving(true);
      try {
        // Préparer les données pour la sauvegarde
        const saveData = {
          title: play.title,
          subtitle: play.subtitle || null,
          rawContent: content,
          htmlContent: htmlContent,
        };

        await storageService.savePlay(id, saveData);
        setLastSavedContent(content);
        setHasUnsavedChanges(false);

        // Afficher le toast seulement pour les sauvegardes manuelles
        if (!isAutoSave) {
          toast.success("Pièce sauvegardée");
        }
      } catch (error) {
        toast.error(error.message || "Erreur lors de la sauvegarde");
        // Error already handled by toast notification
      } finally {
        setIsSaving(false);
      }
    },
    [id, content, htmlContent, play],
  );

  /**
   * Met à jour l'état des boutons undo/redo
   */
  const updateUndoRedoState = useCallback(() => {
    if (editorRef.current) {
      setCanUndo(editorRef.current.canUndo?.() ?? false);
      setCanRedo(editorRef.current.canRedo?.() ?? false);
    }
  }, []);

  // Mémoïser le tableau characters
  const characters = useMemo(
    () => structure?.personnages || [],
    [structure?.personnages],
  );

  // Calculer l'acte et la scène actifs basés sur la position du curseur
  const { activeActeIndex, activeSceneIndex, activeOrphanSceneIndex, isBeforeStructure } = useMemo(() => {
    if (!structure?.items || currentLine === null) {
      return { activeActeIndex: -1, activeSceneIndex: -1, activeOrphanSceneIndex: -1, isBeforeStructure: false };
    }

    let foundActeIndex = -1;
    let foundSceneIndex = -1;
    let foundOrphanSceneIndex = -1;

    // Chercher dans les scènes orphelines (avant le premier acte)
    const orphanScenes = structure.orphanScenes || [];
    const firstActeStart = structure.items[0]?.position?.start ?? Infinity;

    for (let i = 0; i < orphanScenes.length; i++) {
      const scene = orphanScenes[i];
      const sceneStart = scene.position?.start ?? 0;
      const nextScene = orphanScenes[i + 1];
      const sceneEnd = nextScene ? nextScene.position?.start : firstActeStart;

      if (currentLine >= sceneStart && currentLine < sceneEnd) {
        foundOrphanSceneIndex = i;
        break;
      }
    }

    // Parcourir les actes pour trouver celui qui contient la ligne actuelle
    if (foundOrphanSceneIndex === -1) {
      for (let i = 0; i < structure.items.length; i++) {
        const acte = structure.items[i];
        const acteStart = acte.position?.start ?? 0;
        const nextActe = structure.items[i + 1];
        const acteEnd = nextActe ? nextActe.position?.start : Infinity;

        if (currentLine >= acteStart && currentLine < acteEnd) {
          foundActeIndex = i;

          // Chercher la scène active dans cet acte
          if (acte.scenes) {
            for (let j = 0; j < acte.scenes.length; j++) {
              const scene = acte.scenes[j];
              const sceneStart = scene.position?.start ?? 0;
              const nextScene = acte.scenes[j + 1];
              const sceneEnd = nextScene ? nextScene.position?.start : acteEnd;

              if (currentLine >= sceneStart && currentLine < sceneEnd) {
                foundSceneIndex = j;
                break;
              }
            }
          }
          break;
        }
      }
    }

    return {
      activeActeIndex: foundActeIndex,
      activeSceneIndex: foundSceneIndex,
      activeOrphanSceneIndex: foundOrphanSceneIndex,
      isBeforeStructure: foundActeIndex === -1 && foundOrphanSceneIndex === -1,
    };
  }, [structure?.items, structure?.orphanScenes, currentLine]);

  /**
   * Gère le changement de contenu dans l'éditeur
   */
  const handleContentChange = useCallback(
    (newContent) => {
      // Track changes pour le versioning
      if (
        previousContentRef.current &&
        newContent !== previousContentRef.current
      ) {
        trackChanges(previousContentRef.current, newContent);
      }
      previousContentRef.current = newContent;

      setContent(newContent);
      setHasUnsavedChanges(true);

      // Mettre à jour l'état undo/redo après chaque modification
      updateUndoRedoState();
    },
    [updateUndoRedoState, trackChanges],
  );

  /**
   * Handler pour undo
   */
  const handleUndo = useCallback(() => {
    if (editorRef.current?.undo) {
      editorRef.current.undo();
      updateUndoRedoState();
    }
  }, [updateUndoRedoState]);

  /**
   * Handler pour redo
   */
  const handleRedo = useCallback(() => {
    if (editorRef.current?.redo) {
      editorRef.current.redo();
      updateUndoRedoState();
    }
  }, [updateUndoRedoState]);

  /**
   * Handler pour toggle format (syntaxe mobile)
   */
  const handleToggleFormat = useCallback(
    (formatType) => {
      editorRef.current?.toggleLineFormat(formatType);
      updateUndoRedoState();
    },
    [updateUndoRedoState],
  );

  /**
   * Gère le changement de titre
   */
  const handleTitleChange = useCallback((newTitle) => {
    setPlay((prev) => (prev ? { ...prev, title: newTitle } : null));
    setHasUnsavedChanges(true);
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
   * Créer un point de restauration manuel
   */
  const handleCreateManualVersion = useCallback(() => {
    createVersion("manual");
  }, [createVersion]);

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

  /**
   * Synchroniser la ref avec le state pour le beforeunload
   * (évite les réattachements constants du listener)
   */
  useEffect(() => {
    hasUnsavedVersionChangesRef.current = hasUnsavedVersionChanges;
  }, [hasUnsavedVersionChanges]);

  /**
   * Gestion du beforeunload : créer version session_close si changements non versionnés
   */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Utilise la ref au lieu du state (évite les dépendances)
      if (hasUnsavedVersionChangesRef.current) {
        // Utiliser sendBeacon pour envoyer la requête de manière asynchrone
        // Note: sendBeacon est plus fiable que fetch avec keepalive pour beforeunload
        const data = JSON.stringify({
          versionType: "session_close",
        });

        const token = localStorage.getItem("token");
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const url = `${apiUrl}/plays/${id}/versions`;

        // Tenter d'envoyer avec sendBeacon (méthode POST automatique)
        // Note: sendBeacon ne supporte pas les headers custom facilement
        // On utilise donc fetch avec keepalive en fallback
        if (navigator.sendBeacon) {
          const blob = new Blob([data], { type: "application/json" });
          navigator.sendBeacon(url, blob);
        } else {
          // Fallback: fetch avec keepalive
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: data,
            keepalive: true,
          }).catch((error) => {
            console.error(
              "[Versioning] Error creating session_close version:",
              error,
            );
          });
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id]); // hasUnsavedVersionChanges retiré → utilise la ref

  /**
   * Sauvegarde automatique après 2 secondes d'inactivité
   */
  useEffect(() => {
    // Ne pas déclencher l'auto-save si le contenu n'a pas changé
    if (content === lastSavedContent || !play) {
      return;
    }

    // Annuler le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Programmer la sauvegarde automatique
    saveTimeoutRef.current = setTimeout(() => {
      savePlay(true); // true = sauvegarde automatique (silencieuse)
    }, 2000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, lastSavedContent, savePlay, play]);

  /**
   * Insérer un nom de personnage dans l'éditeur
   */
  const handleCharacterClick = useCallback((characterName) => {
    if (!editorRef.current) return;
    editorRef.current.insertText(`@${characterName}\n`);
  }, []);

  /**
   * Gère le changement de position du curseur
   */
  const handleCursorChange = useCallback((line) => {
    setCurrentLine(line);
  }, []);

  /**
   * Naviguer vers une section dans l'éditeur
   */
  const handleSectionClick = useCallback((position) => {
    if (!editorRef.current || !position) return;

    // Utiliser la fonction scrollToLine de l'éditeur pour déplacer le curseur
    if (editorRef.current.scrollToLine) {
      editorRef.current.scrollToLine(position.start + 1);
    }
  }, []);

  /**
   * Ouvre le modal de mise en page
   */
  const handleOpenLayoutModal = useCallback(() => {
    setShowPageSettingsModal(true);
  }, []);

  /**
   * Ouvre le modal des parametres editeur
   */
  const handleOpenEditorSettings = useCallback(() => {
    setShowEditorSettingsModal(true);
  }, []);

  /**
   * Ouvre le modal d'export PDF
   */
  const handleOpenExport = useCallback(() => {
    setShowPdfExportModal(true);
  }, []);

  /**
   * Ouvre le modal d'historique des versions
   */
  const handleOpenVersions = useCallback(() => {
    setShowVersionsModal(true);
  }, []);

  const handleOpenStats = useCallback(() => {
    setShowStatsModal(true);
  }, []);

  /**
   * Gere les changements de settings de mise en page
   */
  const handleSettingsChange = useCallback(
    async (newSettings) => {
      // Mettre a jour les etats locaux
      setPaperSize(newSettings.paperSize);
      setPresetId(newSettings.presetId || null);

      // Sauvegarder sur le serveur
      try {
        await storageService.updatePlaySettings(id, {
          paperSize: newSettings.paperSize,
          // presetId sera persisté dans une future migration BDD
        });

        // Persister le presetId en localStorage en attendant la migration BDD
        if (newSettings.presetId) {
          localStorage.setItem(`scenacte_preset_${id}`, newSettings.presetId);
        } else {
          localStorage.removeItem(`scenacte_preset_${id}`);
        }

        toast.success("Parametres de mise en page enregistres");
      } catch (error) {
        toast.error("Erreur lors de la sauvegarde des parametres");
        throw error;
      }
    },
    [id],
  );

  return (
    <div className="flex flex-col h-dvh bg-surface-strong">
      <EditorHeader
        title={play?.title || ""}
        onTitleChange={handleTitleChange}
        isSaving={isSaving}
        onCreateVersion={handleCreateManualVersion}
        hasUnsavedChanges={hasUnsavedVersionChanges}
        isOnline={true}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenStats={handleOpenStats}
        onOpenVersions={handleOpenVersions}
        onOpenPageSettings={handleOpenLayoutModal}
        onOpenExport={handleOpenExport}
        user={user}
        onLogout={logout}
      />

      <EditorWorkspace
        structure={structure}
        characters={characters}
        activeActeIndex={activeActeIndex}
        activeSceneIndex={activeSceneIndex}
        activeOrphanSceneIndex={activeOrphanSceneIndex}
        isBeforeStructure={isBeforeStructure}
        onSectionClick={handleSectionClick}
        onCharacterClick={handleCharacterClick}
        editorRef={editorRef}
        content={content}
        onContentChange={handleContentChange}
        onCursorChange={handleCursorChange}
        preset={preset}
        htmlContent={htmlContent}
      />

      <SyntaxBar
        onToggleFormat={handleToggleFormat}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenStats={handleOpenStats}
        onOpenVersions={handleOpenVersions}
        onOpenPageSettings={handleOpenLayoutModal}
        onOpenExport={handleOpenExport}
      />

      {/* Modal Editeur */}
      <EditorSettingsModal
        open={showEditorSettingsModal}
        onOpenChange={setShowEditorSettingsModal}
      />

      {/* Modal Mise en page */}
      <PageSettingsModal
        open={showPageSettingsModal}
        onOpenChange={setShowPageSettingsModal}
        playId={id}
        currentPaperSize={paperSize}
        currentPresetId={presetId}
        onSettingsChange={handleSettingsChange}
      />

      {/* Modal Export PDF */}
      <ExportModal
        open={showPdfExportModal}
        onOpenChange={setShowPdfExportModal}
        htmlContent={htmlContent}
        playTitle={play?.title}
        playSubtitle={play?.subtitle}
        pageFormat={paperSize}
        presetId={presetId}
        onOpenLayoutModal={handleOpenLayoutModal}
      />

      {/* Modal Statistiques */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        statistics={statistics}
        playTitle={play?.title}
      />

      {/* Modal Historique des versions */}
      <VersionHistoryModal
        isOpen={showVersionsModal}
        onClose={() => setShowVersionsModal(false)}
        play={play}
        onRestore={fetchPlay}
      />
    </div>
  );
}
