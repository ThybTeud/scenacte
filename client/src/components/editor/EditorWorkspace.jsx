import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeMirrorEditor } from "@/components/editors/CodeMirrorEditor";
import { EditorStructurePanel } from "@/components/editor/EditorStructurePanel";
import { EditorPreviewPanel } from "@/components/editor/EditorPreviewPanel";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";

export function EditorWorkspace({
  structure,
  characters,
  activeActeIndex,
  activeSceneIndex,
  onSectionClick,
  onCharacterClick,
  editorRef,
  content,
  onContentChange,
  onCursorChange,
  preset,
  htmlContent,
}) {
  const [showEditorHelp, setShowEditorHelp] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  return (
    <main className="flex-1 overflow-hidden p-4 min-h-0 bg-gray-400">
      <div className="flex justify-center relative w-full h-full">
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
          {showEditorHelp && (
            <EditorStructurePanel
              structure={structure}
              characters={characters}
              activeActeIndex={activeActeIndex}
              activeSceneIndex={activeSceneIndex}
              onSectionClick={onSectionClick}
              onCharacterClick={onCharacterClick}
              onClose={() => setShowEditorHelp(false)}
            />
          )}

          <div className="flex-1 flex flex-col min-w-0 max-w-3xl h-full">
            <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto overflow-hidden min-h-0 border-2 border-gray-900 rounded-lg shadow-brutal">
              <div className="hidden sm:flex px-6 items-center h-16 shrink-0 bg-gray-200 border-b-2 border-gray-900 font-bold uppercase">
                Éditeur
              </div>
              <CodeMirrorEditor
                ref={editorRef}
                value={content}
                onChange={onContentChange}
                onCursorChange={onCursorChange}
                characters={characters}
              />
            </div>
          </div>

          {showPreview && (
            <EditorPreviewPanel
              preset={preset}
              htmlContent={htmlContent}
              onClose={() => setShowPreview(false)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
