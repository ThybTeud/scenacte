import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { SAMPLE_PLAY } from "@/config/sample-play";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSyncScroll } from "@/hooks/useSyncScroll";
import { usePlayParsing } from "@/hooks/usePlayParsing";
import { PlayParser } from "@/utils/playParser";
import { getPreset } from "@/config/template-presets";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, SidebarProvider, SidebarInset, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { SidebarLogo } from "@/components/sidebar/SidebarLogo";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import ExportModal from "@/components/modals/ExportModal";
import StatsModal from "@/components/modals/StatsModal";
import PageSettingsModal from "@/components/modals/PageSettingsModal";
import { Download, FileText, ChartPie } from "lucide-react";

export default function TestEditorPage() {
  document.title = "Scenacte — Mode test";

  const [content, setContent] = useState(SAMPLE_PLAY);
  const [presetId, setPresetId] = useState("classique");
  const [paperSize, setPaperSize] = useState("A5");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPageSettingsModal, setShowPageSettingsModal] = useState(false);

  const editorRef = useRef(null);
  const [currentLine, setCurrentLine] = useState(null);

  // Auto-focus sur l'éditeur au montage
  useEffect(() => {
    if (editorRef.current?.focus) {
      editorRef.current.focus();
      setCurrentLine(0);
    }
  }, []);

  const debouncedContent = useDebouncedValue(content, 300);

  const parser = useMemo(() => new PlayParser(), []);
  const { structure, statistics, htmlContent } = usePlayParsing(debouncedContent, parser);

  const preset = useMemo(() => getPreset(presetId), [presetId]);

  const { editorScrollRef, previewScrollRef, handleEditorScroll, handlePreviewScroll } =
    useSyncScroll();

  const characters = useMemo(() => structure?.personnages || [], [structure?.personnages]);

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

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
  }, []);

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
    <SidebarProvider className="h-dvh bg-surface-strong">
      {/* Sidebar */}
      <Sidebar collapsible="icon" className="border-r-2 border-border overflow-hidden">
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
        <SidebarFooter className="border-t-2 border-border p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Mode test — votre travail ne sera pas sauvegardé.
          </p>
          <Button asChild variant="default" className="w-full">
            <Link to="/register">Créer un compte</Link>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col h-full overflow-hidden bg-surface-strong">
        {/* Header */}
        <header className="flex h-20 shrink-0 items-center gap-4 px-4 border-b-2 border-border bg-sidebar overflow-hidden">
          <SidebarTrigger />
          <span className="font-semibold text-muted-foreground">Mode test</span>
        </header>

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
