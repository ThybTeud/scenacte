import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { SAMPLE_PLAY } from "@/config/sample-play";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSyncScroll } from "@/hooks/useSyncScroll";
import { usePlayParsing } from "@/hooks/usePlayParsing";
import { PlayParser } from "@/utils/playParser";
import { getPreset } from "@/config/template-presets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { BaseHeader } from "@/components/layout/BaseHeader";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import { SyntaxBar } from "@/components/editor/SyntaxBar";
import { FloatingHelpButton } from "@/components/editor/FloatingHelpButton";
import { StatsModal, PageSettingsModal } from "@/components/modals";
import { ChartPie, BookCheck, Download, Dot, Minus } from "lucide-react";

export default function TestEditorPage() {
  document.title = "Scenacte — Mode test";

  const [content, setContent] = useState(SAMPLE_PLAY);
  const [presetId, setPresetId] = useState("classique");
  const [paperSize, setPaperSize] = useState("A5");
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPageSettingsModal, setShowPageSettingsModal] = useState(false);

  const editorRef = useRef(null);
  const [currentLine, setCurrentLine] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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

  const { previewScrollRef, scrollContainerRef, handleEditorScroll } = useSyncScroll();

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

  const updateUndoRedoState = useCallback(() => {
    if (editorRef.current) {
      setCanUndo(editorRef.current.canUndo?.() ?? false);
      setCanRedo(editorRef.current.canRedo?.() ?? false);
    }
  }, []);

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

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

  const handleUndo = useCallback(() => {
    if (editorRef.current?.undo) {
      editorRef.current.undo();
      updateUndoRedoState();
    }
  }, [updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    if (editorRef.current?.redo) {
      editorRef.current.redo();
      updateUndoRedoState();
    }
  }, [updateUndoRedoState]);

  const handleToggleFormat = useCallback((formatType) => {
    editorRef.current?.toggleLineFormat(formatType);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const handlePreviewLineClick = useCallback((lineNumber) => {
    editorRef.current?.scrollToLine(lineNumber + 1);
  }, []);

  const handleSettingsChange = useCallback(({ paperSize: newPaperSize, presetId: newPresetId }) => {
    if (newPaperSize) setPaperSize(newPaperSize);
    if (newPresetId) setPresetId(newPresetId);
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-surface-strong">
      <BaseHeader user={null} onLogout={null} compactLogo>
        <Dot className="h-6 w-6 shrink-0" />
        <Badge variant="secondary" className="text-xs shrink-0">
          Mode test
        </Badge>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" onClick={() => setShowStatsModal(true)}>
                <ChartPie className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Statistiques</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" onClick={() => setShowPageSettingsModal(true)}>
                <BookCheck className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mise en page</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" disabled>
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </TooltipTrigger>
            <TooltipContent>Créez un compte pour exporter</TooltipContent>
          </Tooltip>

          <Minus className="h-6 w-6 shrink-0 rotate-90" />
        </div>
      </BaseHeader>

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
        onEditorScroll={handleEditorScroll}
        preset={preset}
        htmlContent={htmlContent}
        previewScrollRef={previewScrollRef}
        scrollContainerRef={scrollContainerRef}
        onLineClick={handlePreviewLineClick}
      />

      <SyntaxBar
        onToggleFormat={handleToggleFormat}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenVersions={null}
        onOpenPageSettings={() => setShowPageSettingsModal(true)}
        onOpenExport={null}
      />

      <FloatingHelpButton onToggleFormat={handleToggleFormat} showBugReport={false} />

      {/* Modals */}
      <PageSettingsModal
        open={showPageSettingsModal}
        onOpenChange={setShowPageSettingsModal}
        currentPaperSize={paperSize}
        currentPresetId={presetId}
        onSettingsChange={handleSettingsChange}
      />

      <StatsModal
        open={showStatsModal}
        onOpenChange={() => setShowStatsModal(false)}
        statistics={statistics}
        playTitle="Essai"
      />
    </div>
  );
}
