import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSyncScroll } from "@/hooks/useSyncScroll";
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
    const [settingsModalTab, setSettingsModalTab] = useState("editor");

    // Settings de mise en page
    const [paperSize, setPaperSize] = useState("A5");
    const [templateId, setTemplateId] = useState(null);
    const [template, setTemplate] = useState(null);

    // Instance du parser (créée une seule fois)
    const parser = useMemo(() => new PlayParser(), []);

    // Hook pour le scroll synchronisé
    const {
        editorScrollRef,
        previewScrollRef,
        handleEditorScroll,
        handlePreviewScroll,
    } = useSyncScroll();

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
            setContent(newContent);
            setHasUnsavedChanges(true);

            // Mettre à jour l'état undo/redo après chaque modification
            updateUndoRedoState();
        },
        [updateUndoRedoState]
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
        <SidebarProvider className="h-dvh">
            <EditorSidebar
                stats={statistics}
                structure={structure}
                characters={structure?.personnages || []}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
                onCharacterClick={handleCharacterClick}
                onOpenExport={handleOpenExport}
                onOpenEditorSettings={handleOpenEditorSettings}
                onOpenPageSettings={handleOpenLayoutModal}
            />

            <SidebarInset className="flex flex-col h-dvh overflow-hidden">
                <EditorHeader
                    title={play?.title || ""}
                    onTitleChange={handleTitleChange}
                    isSaving={isSaving}
                    onSave={handleManualSave}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview((prev) => !prev)}
                />

                <main className="flex-1 flex justify-center overflow-hidden p-4 min-h-0">
                    <div className="flex w-full max-w-5xl gap-4 h-full">
                        {/* Colonne éditeur */}
                        <div className="flex-1 flex flex-col min-w-0 h-full">
                            <div className="flex-1 w-full max-w-3xl mx-auto overflow-hidden min-h-0">
                                <CodeMirrorEditor
                                    ref={editorRef}
                                    value={content}
                                    onChange={handleContentChange}
                                    onCursorChange={handleCursorChange}
                                    characters={characters}
                                />
                            </div>

                            <div className="w-full max-w-3xl mx-auto mt-2 shrink-0">
                                <SyntaxBar
                                    onInsert={toggleFormat}
                                    onUndo={handleUndo}
                                    onRedo={handleRedo}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                />
                            </div>
                        </div>

                        {/* Preview - masquée sous md */}
                        {showPreview && (
                            <div className="hidden md:flex flex-1 min-w-0 h-full">
                                <div
                                    className="h-full w-full bg-white rounded-lg border overflow-auto p-4 prose prose-sm max-w-none"
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
        </SidebarProvider>
    );
}
