import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSyncScroll } from "@/hooks/useSyncScroll";
import { useVersioning } from "@/hooks/useVersioning";
import { toast } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { EditorSidebar } from "@/components/sidebar";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { SyntaxBar } from "@/components/editor/SyntaxBar";
import { CodeMirrorEditor } from "@/components/editors/CodeMirrorEditor";
import { usePlayParsing } from "@/hooks/usePlayParsing";
import { PlayParser } from "@/utils/playParser";
import SettingsModal from "@/components/modals/SettingsModal";
import ExportModal from "@/components/modals/ExportModal";
import VersionHistoryModal from "@/components/modals/VersionHistoryModal";
import StatsModal from "@/components/modals/StatsModal";
import { getPreviewCSS } from "@/utils/pdfExport";
import { PanelRightClose } from "lucide-react";

export default function EditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout, isGuest } = useAuth();

    const [play, setPlay] = useState(null);
    const [lastSavedContent, setLastSavedContent] = useState("");

    // État du document
    const [activeSection, setActiveSection] = useState("scene-1-2");
    const [content, setContent] = useState("");

    // Référence à l'éditeur CodeMirror pour l'insertion de texte
    const editorRef = useRef(null);

    // A NETTOYER : currentLine est utilisé, mais setCurrentLine n'est pas utilisé
    const [currentLine, setCurrentLine] = useState(0);

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
    const [showPreview, setShowPreview] = useState(true);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // States modals
    const [showPdfExportModal, setShowPdfExportModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showVersionsModal, setShowVersionsModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [settingsModalTab, setSettingsModalTab] = useState("editor");

    // Settings de mise en page
    const [paperSize, setPaperSize] = useState("A5");
    const [templateId, setTemplateId] = useState(null);
    const [template, setTemplate] = useState(null);

    // CSS dynamique pour la preview basé sur le template
    const previewCSS = useMemo(() => getPreviewCSS(template?.settings), [template?.settings]);

    // Instance du parser (créée une seule fois)
    const parser = useMemo(() => new PlayParser(), []);

    // Hook pour le scroll synchronisé
    const {
        editorScrollRef,
        previewScrollRef,
        handleEditorScroll,
        handlePreviewScroll,
    } = useSyncScroll();

    // Hook versioning (désactivé en mode guest)
    const {
        trackChanges,
        createVersion,
        hasUnsavedChanges: hasUnsavedVersionChanges,
        charsSinceLastVersion,
    } = useVersioning(id, !isGuest);

    // Hook parsing (utilise le contenu debouncé pour optimiser les performances)
    // PROPOSITION ARRIVEE DANS LE REFACTO : A CONSIDERER PAR RAPPORT A LA LIGNE SUIVANTE
    // const { htmlContent, structure } = usePlayParsing(debouncedContent, parser);
    const { structure, statistics, htmlContent } = usePlayParsing(
        debouncedContent,
        parser
    );

    // Chargement initial de la pièce
    useEffect(() => {
        fetchPlay();
    }, [id]);

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
            setTemplateId(response.play.templateId || null);
            setTemplate(response.play.template || null);
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
        [id, content, htmlContent, play]
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
        [structure?.personnages]
    );

    /**
     * Gère le changement de contenu dans l'éditeur
     */
    const handleContentChange = useCallback(
        (newContent) => {
            // Track changes pour le versioning
            if (previousContentRef.current && newContent !== previousContentRef.current) {
                trackChanges(previousContentRef.current, newContent);
            }
            previousContentRef.current = newContent;

            setContent(newContent);
            setHasUnsavedChanges(true);

            // Mettre à jour l'état undo/redo après chaque modification
            updateUndoRedoState();
        },
        [updateUndoRedoState, trackChanges]
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
     * Gère le changement de titre
     */
    const handleTitleChange = useCallback((newTitle) => {
        setPlay(prev => prev ? { ...prev, title: newTitle } : null);
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
        createVersion('manual');
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
            if (hasUnsavedVersionChangesRef.current && !isGuest) {
                // Utiliser sendBeacon pour envoyer la requête de manière asynchrone
                // Note: sendBeacon est plus fiable que fetch avec keepalive pour beforeunload
                const data = JSON.stringify({
                    versionType: 'session_close',
                });

                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const url = `${apiUrl}/plays/${id}/versions`;

                // Tenter d'envoyer avec sendBeacon (méthode POST automatique)
                // Note: sendBeacon ne supporte pas les headers custom facilement
                // On utilise donc fetch avec keepalive en fallback
                if (navigator.sendBeacon) {
                    const blob = new Blob([data], { type: 'application/json' });
                    navigator.sendBeacon(url, blob);
                } else {
                    // Fallback: fetch avec keepalive
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: data,
                        keepalive: true,
                    }).catch((error) => {
                        console.error('[Versioning] Error creating session_close version:', error);
                    });
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [id, isGuest]); // hasUnsavedVersionChanges retiré → utilise la ref

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

    // MODIFICATION FONCTIONNALITÉ INTEGRATION : INSÉRER SYNTAXE =/= TOGGLE FORMAT
    // const handleInsertSyntax = useCallback((syntax) => {
    //     if (!editorRef.current) return;

    //     // Mapper la syntaxe vers le formatType attendu par toggleLineFormat
    //     const formatMap = {
    //         "#": "heading1",
    //         "##": "heading2",
    //         "@": "personnage",
    //         "(": "didascalie",
    //         "": "dialogue",
    //     };

    //     const formatType = formatMap[syntax];
    //     if (formatType) {
    //         editorRef.current.toggleLineFormat(formatType);
    //     }
    // }, []);

    /**
     * Toggle un format de ligne dans l'éditeur
     */
    const toggleFormat = useCallback((formatId) => {
        if (!editorRef.current || !editorRef.current.toggleLineFormat) return;

        // Mapper les IDs des boutons vers les types de format
        const formatTypeMap = {
            acte: "heading",
            scene: "heading",
            personnage: "personnage",
            didascalie: "didascalie",
            dialogue: "dialogue",
        };

        const formatType = formatTypeMap[formatId];
        if (formatType) {
            editorRef.current.toggleLineFormat(formatType);
        }
    }, []);

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
    const handleSectionClick = useCallback(
        (position) => {
            if (!editorRef.current || !position) return;

            // Utiliser la fonction de scroll de l'éditeur
            if (
                editorScrollRef.current &&
                editorScrollRef.current.scrollToLine
            ) {
                editorScrollRef.current.scrollToLine(position.start + 1);
            }
        },
        [editorScrollRef]
    );

    /**
     * Ouvre le modal de mise en page
     */
    const handleOpenLayoutModal = useCallback(() => {
        setSettingsModalTab("page");
        setShowSettingsModal(true);
    }, []);

    /**
     * Ouvre le modal des parametres editeur
     */
    const handleOpenEditorSettings = useCallback(() => {
        setSettingsModalTab("editor");
        setShowSettingsModal(true);
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
            setTemplateId(newSettings.templateId);
            setTemplate(newSettings.template);

            // Sauvegarder sur le serveur
            try {
                await storageService.updatePlaySettings(id, {
                    paperSize: newSettings.paperSize,
                    templateId: newSettings.templateId,
                });
                toast.success("Parametres de mise en page enregistres");
            } catch (error) {
                toast.error("Erreur lors de la sauvegarde des parametres");
                throw error;
            }
        },
        [id]
    );

    return (
        <SidebarProvider className="h-dvh bg-gray-400">
            <EditorSidebar
                structure={structure}
                characters={structure?.personnages || []}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
                onCharacterClick={handleCharacterClick}
                onOpenExport={handleOpenExport}
                onOpenEditorSettings={handleOpenEditorSettings}
                onOpenPageSettings={handleOpenLayoutModal}
                onVersionsClick={handleOpenVersions}
                onOpenStats={handleOpenStats}
            />

            <SidebarInset className="flex flex-col h-dvh overflow-hidden bg-gray-400">
                <EditorHeader
                    title={play?.title || ""}
                    onTitleChange={handleTitleChange}
                    isSaving={isSaving}
                    onSave={handleManualSave}
                    onCreateVersion={handleCreateManualVersion}
                    hasUnsavedChanges={hasUnsavedVersionChanges}
                    isOnline={!isGuest}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview((prev) => !prev)}
                />

                <main className="flex-1 flex justify-center overflow-hidden p-4 min-h-0 h-dvh bg-gray-400">
                    <div className="flex w-full max-w-5xl gap-4 h-full">
                        {/* Colonne éditeur */}
                        <div className="flex-1 flex flex-col min-w-0 h-full">
                            <div className="flex-1 w-full max-w-3xl mx-auto overflow-hidden min-h-0 border-2 border-gray-900 rounded-lg shadow-brutal">
                                <div className="hidden sm:flex px-6 py-3 bg-gray-200 border-b-2 border-gray-900 font-bold uppercase">Éditeur</div>
                                <CodeMirrorEditor
                                    ref={editorRef}
                                    value={content}
                                    onChange={handleContentChange}
                                    onCursorChange={handleCursorChange}
                                    characters={characters}
                                />
                            </div>

                            {/* MASQUE EN ATTENDANT D'ACTIVER LES BOUTONS */}
                            {/* <div className="w-full max-w-3xl mx-auto mt-2 shrink-0">
                                <SyntaxBar
                                    onInsert={toggleFormat}
                                    onUndo={handleUndo}
                                    onRedo={handleRedo}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                />
                            </div> */}
                        </div>

                        {/* Preview - masquée sous md */}
                        {showPreview && (
                            <div className="hidden md:flex md:flex-col flex-1 min-w-0 h-full overflow-hidden border-2 border-gray-900 rounded-lg shadow-brutal">
                                <div className="px-6 py-3 bg-gray-200 border-b-2 border-gray-900 flex items-center justify-between">
                                    <div className="font-bold uppercase">Aperçu</div>
                                    <PanelRightClose />
                                </div>
                                <style>{previewCSS}</style>
                                <div
                                    className="preview-content h-full w-full bg-white overflow-auto p-4"
                                    dangerouslySetInnerHTML={{
                                        __html: htmlContent,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>

            {/* Modal Settings */}
            <SettingsModal
                open={showSettingsModal}
                onOpenChange={setShowSettingsModal}
                defaultTab={settingsModalTab}
                playId={id}
                currentPaperSize={paperSize}
                currentTemplateId={templateId}
                currentTemplate={template}
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
                template={template}
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
        </SidebarProvider>
    );
}
