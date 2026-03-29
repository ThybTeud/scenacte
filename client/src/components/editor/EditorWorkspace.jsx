import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeMirrorEditor } from "@/components/editors/CodeMirrorEditor";
import { EditorStructurePanel } from "@/components/editor/EditorStructurePanel";
import { EditorPreviewPanel } from "@/components/editor/EditorPreviewPanel";
import { Eye } from "lucide-react";

export function EditorWorkspace({
  structure,
  characters,
  activeActeIndex,
  activeSceneIndex,
  activeOrphanSceneIndex,
  isBeforeStructure,
  onSectionClick,
  onCharacterClick,
  editorRef,
  content,
  onContentChange,
  onCursorChange,
  onEditorScroll,
  preset,
  paperFormatId,
  htmlContent,
  previewScrollRef,
  scrollContainerRef,
  onLineClick,
}) {
  const [showEditorHelp, setShowEditorHelp] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  return (
    <main className="flex-1 overflow-hidden p-4 min-h-0 bg-surface-strong">
      <div className="flex justify-center relative w-full h-full">
        <div className="flex justify-center gap-4 h-full w-full max-w-6xl">
          <EditorStructurePanel
            structure={structure}
            characters={characters}
            activeActeIndex={activeActeIndex}
            activeSceneIndex={activeSceneIndex}
            activeOrphanSceneIndex={activeOrphanSceneIndex}
            isBeforeStructure={isBeforeStructure}
            onSectionClick={onSectionClick}
            onCharacterClick={onCharacterClick}
          />

          <div className={`flex-1 flex flex-col md:flex-row min-w-0 ${showPreview ? "max-w-5xl" : "max-w-xl"} h-full md:border-2 md:border-border md:rounded-sm md:shadow-brutal md:overflow-hidden`}>
            <div className="flex-1 flex flex-col w-full overflow-hidden min-h-0 border-2 border-border rounded-sm shadow-brutal md:border-0 md:rounded-none md:shadow-none">
              <div className="hidden md:flex px-6 items-center justify-between h-16 shrink-0 bg-surface-muted border-b-2 border-border">
                <span className="font-bold uppercase font-heading">Éditeur</span>
                {!showPreview && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="hidden md:flex"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye />
                  </Button>
                )}
              </div>
              <CodeMirrorEditor
                ref={editorRef}
                value={content}
                onChange={onContentChange}
                onCursorChange={onCursorChange}
                onScroll={onEditorScroll}
                characters={characters}
              />
            </div>
          {showPreview && (
            <EditorPreviewPanel
              preset={preset}
              paperFormatId={paperFormatId}
              htmlContent={htmlContent}
              onClose={() => setShowPreview(false)}
              previewScrollRef={previewScrollRef}
              scrollContainerRef={scrollContainerRef}
              onLineClick={onLineClick}
            />
          )}
          </div>

        </div>
      </div>
    </main>
  );
}
