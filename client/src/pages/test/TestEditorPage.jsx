import { useState, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { SAMPLE_PLAY } from "@/config/sample-play";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSyncScroll } from "@/hooks/useSyncScroll";
import { usePlayParsing } from "@/hooks/usePlayParsing";
import { PlayParser } from "@/utils/playParser";
import { shadowPreviewCSS, adaptForShadow } from "@/utils/shadowPreview";
import { generatePresetCSS, getPreset } from "@/config/template-presets";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { SidebarLogo } from "@/components/sidebar/SidebarLogo";
import { CodeMirrorEditor } from "@/components/editors/CodeMirrorEditor";
import ShadowPreview from "@/components/editors/ShadowPreview";
import ExportModal from "@/components/modals/ExportModal";
import StatsModal from "@/components/modals/StatsModal";
import PageSettingsModal from "@/components/modals/PageSettingsModal";
import {
  Download,
  FileText,
  ChartPie,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function TestEditorPage() {
  document.title = "Scenacte — Essai gratuit";

  const [content, setContent] = useState(SAMPLE_PLAY);
  const [presetId, setPresetId] = useState("classique");
  const [paperSize, setPaperSize] = useState("A5");
  const [showPreview, setShowPreview] = useState(true);
  const [showEditorHelp, setShowEditorHelp] = useState(true);

  const [showExportModal, setShowExportModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPageSettingsModal, setShowPageSettingsModal] = useState(false);

  const editorRef = useRef(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const debouncedContent = useDebouncedValue(content, 300);

  const parser = useMemo(() => new PlayParser(), []);
  const { structure, statistics, htmlContent } = usePlayParsing(debouncedContent, parser);

  const preset = useMemo(() => getPreset(presetId), [presetId]);

  const { editorScrollRef, previewScrollRef, handleEditorScroll, handlePreviewScroll } =
    useSyncScroll();

  const characters = useMemo(() => structure?.personnages || [], [structure?.personnages]);

  const { activeActeIndex, activeSceneIndex } = useMemo(() => {
    if (!structure?.items || currentLine === 0) {
      return { activeActeIndex: -1, activeSceneIndex: -1 };
    }

    let foundActeIndex = -1;
    let foundSceneIndex = -1;

    for (let i = 0; i < structure.items.length; i++) {
      const acte = structure.items[i];
      const acteStart = acte.position?.start ?? 0;
      const nextActe = structure.items[i + 1];
      const acteEnd = nextActe ? nextActe.position?.start : Infinity;

      if (currentLine >= acteStart && currentLine < acteEnd) {
        foundActeIndex = i;
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

    return { activeActeIndex: foundActeIndex, activeSceneIndex: foundSceneIndex };
  }, [structure?.items, currentLine]);

  const updateUndoRedoState = useCallback(() => {
    if (editorRef.current) {
      setCanUndo(editorRef.current.canUndo?.() ?? false);
      setCanRedo(editorRef.current.canRedo?.() ?? false);
    }
  }, []);

  const handleContentChange = useCallback(
    (newContent) => {
      setContent(newContent);
      updateUndoRedoState();
    },
    [updateUndoRedoState],
  );

  const handleCursorChange = useCallback((line) => {
    setCurrentLine(line);
  }, []);

  const handleSectionClick = useCallback((position) => {
    if (!editorRef.current || !position) return;
    if (editorRef.current.scrollToLine) {
      editorRef.current.scrollToLine(position.start + 1);
    }
  }, []);

  const handleCharacterClick = useCallback((characterName) => {
    if (!editorRef.current) return;
    editorRef.current.insertText(`@${characterName}\n`);
  }, []);

  const handleSettingsChange = useCallback(({ paperSize: newPaperSize, presetId: newPresetId }) => {
    if (newPaperSize) setPaperSize(newPaperSize);
    if (newPresetId) setPresetId(newPresetId);
  }, []);

  return (
    <SidebarProvider className="h-dvh bg-gray-400">
      {/* Sidebar */}
      <Sidebar collapsible="icon" className="border-r-2 border-gray-900 overflow-hidden">
        <SidebarLogo />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase">Outils</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Statistiques */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Statistiques"
                    className="cursor-pointer"
                    onClick={() => setShowStatsModal(true)}
                  >
                    <ChartPie className="h-4 w-4" />
                    <span>Stats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Mise en page */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Mise en page"
                    className="cursor-pointer"
                    onClick={() => setShowPageSettingsModal(true)}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Mise en page</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Export */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Exporter"
                    className="cursor-pointer"
                    onClick={() => setShowExportModal(true)}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* CTA footer */}
        <SidebarFooter className="border-t-2 border-gray-900 p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Mode test — votre travail ne sera pas sauvegardé.
          </p>
          <Button asChild variant="default" className="w-full">
            <Link to="/register">Créer un compte</Link>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col h-full overflow-hidden bg-gray-400">
        {/* Header */}
        <header className="flex h-20 shrink-0 items-center gap-4 px-4 border-b-2 border-gray-900 bg-sidebar overflow-hidden">
          <span className="font-semibold text-muted-foreground">Mode test</span>
        </header>

        <main className="flex-1 overflow-hidden p-4 min-h-0 bg-gray-400">
          <div className="flex justify-center relative w-full h-full">
            {/* Bouton flottant pour ouvrir l'aide éditeur */}
            {!showEditorHelp && (
              <Button
                variant="secondary"
                size="icon"
                className="hidden md:flex absolute left-0 top-4 bg-gray-200 border-2 border-gray-900 rounded-md shadow-brutal-sm hover:bg-gray-300 z-10"
                onClick={() => setShowEditorHelp(true)}
              >
                <PanelLeftOpen className="fill-white" />
              </Button>
            )}

            {/* Bouton flottant pour ouvrir l'aperçu */}
            {!showPreview && (
              <Button
                variant="secondary"
                size="icon"
                className="hidden md:flex absolute right-0 top-4 bg-gray-200 border-2 border-gray-900 rounded-md shadow-brutal-sm hover:bg-gray-300 z-10"
                onClick={() => setShowPreview(true)}
              >
                <PanelRightOpen className="fill-white" />
              </Button>
            )}

            <div className="flex justify-center gap-4 h-full w-full max-w-6xl">
              {/* Panneau structure */}
              {showEditorHelp && (
                <div className="hidden md:flex md:flex-col w-48 shrink-0 h-full overflow-hidden border-2 border-gray-900 rounded-lg shadow-brutal">
                  <div className="px-6 h-16 bg-gray-200 border-b-2 border-gray-900 flex items-center justify-between">
                    <div className="font-bold uppercase">Structure</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowEditorHelp(false)}
                    >
                      <PanelLeftClose className="fill-white" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto p-4 bg-white">
                    {/* Sommaire */}
                    <div className="mb-4">
                      <div className="font-semibold uppercase text-sm mb-2">Sommaire</div>
                      <div className="space-y-2 text-xs">
                        {structure?.items?.map((acte, acteIndex) => (
                          <div key={acteIndex} className="space-y-1">
                            <button
                              className={`w-full text-left px-2 py-1 rounded hover:bg-pink-100 clamp-1 ${
                                activeActeIndex === acteIndex ? "bg-rose-200 font-semibold" : ""
                              }`}
                              onClick={() => handleSectionClick(acte.position)}
                            >
                              {acte.value || `Acte ${acteIndex + 1}`}
                            </button>
                            <div className="ml-2 space-y-1">
                              {acte.scenes?.map((scene, sceneIndex) => (
                                <button
                                  key={sceneIndex}
                                  className={`w-full text-left pl-2 pr-2 py-1 rounded hover:bg-pink-100 hover:text-gray-900 ${
                                    activeActeIndex === acteIndex &&
                                    activeSceneIndex === sceneIndex
                                      ? "bg-rose-400 text-white font-semibold"
                                      : ""
                                  }`}
                                  onClick={() => handleSectionClick(scene.position)}
                                >
                                  {scene.value || `Scène ${sceneIndex + 1}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personnages */}
                    <div>
                      <div className="font-semibold uppercase text-sm mb-2">Personnages</div>
                      <div className="space-y-1">
                        {characters.map((character, index) => (
                          <button
                            key={character || index}
                            className="w-full text-left px-2 py-1 font-editor font-semibold text-sm text-blue-600 hover:bg-blue-50 rounded"
                            onClick={() => handleCharacterClick(character)}
                          >
                            @{character}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Colonne éditeur */}
              <div className="flex-1 flex flex-col min-w-0 max-w-3xl h-full">
                <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto overflow-hidden min-h-0 border-2 border-gray-900 rounded-lg shadow-brutal">
                  <div className="hidden sm:flex px-6 items-center h-16 shrink-0 bg-gray-200 border-b-2 border-gray-900 font-bold uppercase">
                    Éditeur
                  </div>
                  <CodeMirrorEditor
                    ref={editorRef}
                    value={content}
                    onChange={handleContentChange}
                    onCursorChange={handleCursorChange}
                    characters={characters}
                  />
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="hidden md:flex md:flex-col flex-1 min-w-0 max-w-lg h-full overflow-hidden border-2 border-gray-900 rounded-lg shadow-brutal">
                  <div className="px-6 h-16 shrink-0 bg-gray-200 border-b-2 border-gray-900 flex items-center justify-between">
                    <div className="font-bold uppercase">Aperçu</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPreview(false)}
                    >
                      <PanelRightClose className="fill-white" />
                    </Button>
                  </div>
                  <div className="overflow-auto flex-1 bg-white">
                    <div className="grid grid-cols-[1rem_1fr_1rem] grid-rows-[1rem_auto_1rem] min-h-full">
                      <div className="border-b-2 border-r-2 border-dashed border-gray-300" />
                      <div className="border-b-2 border-dashed border-gray-300" />
                      <div className="border-b-2 border-l-2 border-dashed border-gray-300" />
                      <div className="border-r-2 border-dashed border-gray-300" />
                      <ShadowPreview
                        css={`${shadowPreviewCSS}\n${adaptForShadow(generatePresetCSS(preset))}`}
                        htmlContent={htmlContent}
                        layout={preset.layout}
                        className="w-full bg-white overflow-auto px-8 py-2"
                      />
                      <div className="border-l-2 border-dashed border-gray-300" />
                      <div className="border-t-2 border-r-2 border-dashed border-gray-300" />
                      <div className="border-t-2 border-dashed border-gray-300" />
                      <div className="border-t-2 border-l-2 border-dashed border-gray-300" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </SidebarInset>

      {/* Modals */}
      <PageSettingsModal
        open={showPageSettingsModal}
        onOpenChange={setShowPageSettingsModal}
        currentPaperSize={paperSize}
        currentPresetId={presetId}
        onSettingsChange={handleSettingsChange}
      />

      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        htmlContent={htmlContent}
        playTitle="Essai"
        pageFormat={paperSize}
        presetId={presetId}
      />

      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        statistics={statistics}
        playTitle="Essai"
      />
    </SidebarProvider>
  );
}
