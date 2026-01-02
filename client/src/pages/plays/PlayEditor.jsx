import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storageService } from "../../services/storage.service";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePlayParsing } from "../../hooks/usePlayParsing";
import { useSyncScroll } from "../../hooks/useSyncScroll";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import HeaderEditor from "../../components/layout/HeaderEditor";
import { Loader } from "../../components/ui/Loader";
import { SidePanel } from "../../components/ui/SidePanel";
import { VersionsSidebar } from "../../components/plays/VersionsSidebar";
import { CodeMirrorEditor } from "../../components/editors/CodeMirrorEditor";
import { PlayPreview } from "../../components/editors/PlayPreview";
import { LeftPanel } from "../../components/editors/LeftPanel";
import { RightPanel } from "../../components/editors/RightPanel";
import { PdfExportModal } from "../../components/pdf/PdfExportModal";
import { GuestModeBanner } from "../../components/ui/GuestModeBanner";
import { MenuIcon } from "../../components/icons/MenuIcon";
import { PlayParser } from "../../utils/playParser";
import toast from "react-hot-toast";

export function PlayEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout, isGuest } = useAuth();

    // Menu items pour HeaderEditor (conditionnels selon mode invité)
    const menuItems = useMemo(
        () =>
            isGuest
                ? [
                      {
                          label: "Créer un compte",
                          onClick: () => navigate("/register"),
                      },
                      {
                          label: "Se connecter",
                          onClick: () => navigate("/login"),
                      },
                  ]
                : [
                      { label: "Profil", onClick: () => navigate("/profile") },
                      { label: "Préférences", onClick: () => navigate("/preferences") },
                      {
                          label: "Déconnexion",
                          onClick: () => {
                              logout();
                              navigate("/login");
                          },
                      },
                  ],
        [navigate, logout, isGuest]
    );

    const [play, setPlay] = useState(null);
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [showPdfExport, setShowPdfExport] = useState(false);
    const saveTimeoutRef = useRef(null);

    // États pour le responsive
    const [showPreview, setShowPreview] = useState(true);
    const [showLeftPanel, setShowLeftPanel] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(false);
    const [currentLine, setCurrentLine] = useState(0);

    // Référence à l'éditeur CodeMirror pour l'insertion de texte
    const editorRef = useRef(null);

    // Hook pour le scroll synchronisé
    const {
        editorScrollRef,
        previewScrollRef,
        handleEditorScroll,
        handlePreviewScroll,
    } = useSyncScroll();

    // Parser pour générer le HTML
    const parser = useMemo(() => new PlayParser(), []);

    // Debounce du contenu pour optimiser le parsing
    const debouncedContent = useDebouncedValue(content, 300);

    // Dérivation directe : parsing en cours si le contenu n'est pas encore debounced
    const isParsing = content !== debouncedContent;

    // Parse l'AST une seule fois et dérive toutes les valeurs nécessaires
    const { structure, statistics, htmlContent } = usePlayParsing(
        debouncedContent,
        parser
    );

    useEffect(() => {
        fetchPlay();
    }, [id]);

    const fetchPlay = async () => {
        setIsLoading(true);
        try {
            const response = await storageService.getPlay(id);
            // En mode invité, response est l'objet play directement, pas { play: ... }
            const playData = response.play || response;
            setPlay(playData);
            const rawContent = playData.rawContent || "";
            setContent(rawContent);
            setHasUnsavedChanges(false);
        } catch (error) {
            toast.error("Erreur lors du chargement de la pièce");
            console.error(error);
            navigate("/plays");
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
            // Préparer les données pour la sauvegarde
            const saveData = {
                title: play.title,
                subtitle: play.subtitle || null,
                rawContent: content,
                htmlContent: htmlContent,
            };

            await storageService.savePlay(id, saveData);
            setHasUnsavedChanges(false);
            toast.success("Pièce sauvegardée");
        } catch (error) {
            toast.error(error.message || "Erreur lors de la sauvegarde");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }, [id, content, htmlContent, play]);

    /**
     * Gère le changement de contenu dans l'éditeur
     */
    const handleContentChange = useCallback((newContent) => {
        setContent(newContent);
        setHasUnsavedChanges(true);
    }, []);

    /**
     * Gère le changement de position du curseur
     */
    const handleCursorChange = useCallback((line) => {
        setCurrentLine(line);
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
    const insertCharacter = useCallback((characterName) => {
        if (!editorRef.current) return;
        editorRef.current.insertText(`@${characterName}\n`);
    }, []);

    /**
     * Naviguer vers une section dans l'éditeur
     */
    const navigateToSection = useCallback(
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
     * Télécharger le contenu brut
     */
    const handleDownload = useCallback(() => {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${play?.title || "piece"}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Fichier téléchargé");
    }, [content, play]);

    /**
     * Hook pour les raccourcis clavier
     */
    useKeyboardShortcuts({
        onToggleFormat: toggleFormat,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <HeaderEditor
                    playTitle="Chargement..."
                    user={user}
                    menuItems={menuItems}
                    onSettingsClick={() => {}}
                    onStatsClick={() => {}}
                />
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
        <div className="h-dvh flex flex-col overflow-hidden bg-orange-100">
            <HeaderEditor
                playTitle={play.title}
                user={user}
                menuItems={menuItems}
                onSettingsClick={() => setShowRightPanel(!showRightPanel)}
                onStatsClick={() => setShowRightPanel(true)}
                onVersionsClick={() => setShowVersions(true)}
                isParsing={isParsing}
                isSaving={isSaving}
                hasUnsavedChanges={hasUnsavedChanges}
                content={content}
            />

            {isGuest && (
                <div className="container-custom py-2">
                    <GuestModeBanner />
                </div>
            )}

            {/* Layout principal : Container centré avec max-width global */}
            <div className="flex-1 flex justify-center overflow-hidden">
                {/* Groupe des 3 colonnes - pas de gap, collées ensemble */}
                <div className="flex overflow-hidden">
                    {/* Left Panel - hidden mobile, visible desktop */}
                    <div className="hidden lg:block flex-shrink-0 h-full">
                        <LeftPanel
                            onUndo={() => {}}
                            onRedo={() => {}}
                            onSave={handleManualSave}
                            onDownload={handleDownload}
                            onExportPdf={() => setShowPdfExport(true)}
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

                    {/* Zone centrale - contraintes min/max */}
                    <div className="flex-1 min-w-0 lg:min-w-[600px] lg:max-w-[900px] flex overflow-hidden">
                        {/* Éditeur CodeMirror */}
                        <div
                            className={cn(
                                "flex flex-col overflow-hidden min-w-0",
                                showPreview ? "flex-1" : "w-full"
                            )}
                        >
                            <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col min-h-0">
                                {/* Mobile: boutons hamburger et sommaire */}
                                <div className="lg:hidden flex items-center justify-between mb-2">
                                    <button
                                        onClick={() =>
                                            setShowLeftPanel(!showLeftPanel)
                                        }
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        aria-label="Toggle menu"
                                    >
                                        <MenuIcon />
                                    </button>

                                    <button
                                        onClick={() =>
                                            setShowRightPanel(!showRightPanel)
                                        }
                                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                                    >
                                        Sommaire
                                    </button>
                                </div>

                                <div className="flex-1 overflow-hidden border-2 rounded-lg shadow-brutal">
                                    <CodeMirrorEditor
                                        ref={editorRef}
                                        value={content}
                                        onChange={handleContentChange}
                                        onCursorChange={handleCursorChange}
                                        onScroll={handleEditorScroll}
                                        scrollSync={editorScrollRef}
                                        characters={structure.personnages || []}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview - Desktop: visible, Mobile: caché */}
                        {showPreview && (
                            <div className="hidden lg:flex lg:flex-1 overflow-hidden justify-center items-start">
                                <div className="h-full aspect-70/99 max-w-full p-4 md:p-8 overflow-hidden flex flex-col">
                                    <div className="flex-1 overflow-hidden min-h-0 border-2 rounded-lg shadow-brutal">
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

                    {/* Right Panel - hidden mobile, visible desktop */}
                    <div className="hidden lg:block flex-shrink-0 h-full">
                        <RightPanel
                            structure={structure}
                            statistics={statistics}
                            onNavigateToSection={navigateToSection}
                            currentLine={currentLine}
                        />
                    </div>
                </div>
            </div>

            {/* SidePanels mobile en overlay - séparés du layout principal */}
            <SidePanel
                isOpen={showLeftPanel}
                onClose={() => setShowLeftPanel(false)}
                position="left"
                className="lg:hidden"
            >
                <LeftPanel
                    onUndo={() => {}}
                    onRedo={() => {}}
                    onSave={handleManualSave}
                    onDownload={handleDownload}
                    onExportPdf={() => setShowPdfExport(true)}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    onToggleFormat={toggleFormat}
                    onInsertCharacter={insertCharacter}
                    characters={structure.personnages || []}
                    canUndo={false}
                    canRedo={false}
                    showPreview={showPreview}
                    isSaving={isSaving}
                />
            </SidePanel>

            <SidePanel
                isOpen={showRightPanel}
                onClose={() => setShowRightPanel(false)}
                position="right"
                className="lg:hidden"
            >
                <RightPanel
                    structure={structure}
                    statistics={statistics}
                    onNavigateToSection={navigateToSection}
                    currentLine={currentLine}
                />
            </SidePanel>

            <VersionsSidebar
                isOpen={showVersions}
                onClose={() => setShowVersions(false)}
                playId={id}
                onRestore={fetchPlay}
            />

            <PdfExportModal
                isOpen={showPdfExport}
                onClose={() => setShowPdfExport(false)}
                playTitle={play.title}
                playSubtitle={play.subtitle}
                htmlContent={htmlContent}
                rawContent={content}
            />
        </div>
    );
}
