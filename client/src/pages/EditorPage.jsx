import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EditorSidebar } from "@/components/sidebar"
import { EditorHeader } from "@/components/editor/EditorHeader"
import { SummaryPanel } from "@/components/editor/SummaryPanel"
import { SyntaxBar } from "@/components/editor/SyntaxBar"

// Mock data
const mockActs = [
  {
    id: 'act-1',
    title: 'Acte 1',
    scenes: [
      { id: 'scene-1-1', title: 'Scène 1' },
      { id: 'scene-1-2', title: 'Scène 2' },
      { id: 'scene-1-3', title: 'Scène 3' },
    ]
  },
  {
    id: 'act-2',
    title: 'Acte 2',
    scenes: [
      { id: 'scene-2-1', title: 'Scène 1' },
      { id: 'scene-2-2', title: 'Scène 2' },
    ]
  }
]

const mockCharacters = [
  { id: '1', name: 'Argante' },
  { id: '2', name: 'Géronte' },
  { id: '3', name: 'Zélide' },
]

export default function EditorPage() {
  const { id } = useParams()
  const [title, setTitle] = useState('Ma pièce de théâtre')
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [activeSection, setActiveSection] = useState('scene-1-2')

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  const handleInsertSyntax = (syntax) => {
    console.log('Insert syntax:', syntax)
  }

  const handleCharacterClick = (name) => {
    console.log('Insert character:', name)
  }

  const handleUndo = () => console.log('undo')
  const handleRedo = () => console.log('redo')

  return (
    <SidebarProvider>
      <EditorSidebar stats={{ scenes: 12, repliques: 156, characters: 5 }} />
      <SidebarInset>
        <EditorHeader
          title={title}
          onTitleChange={setTitle}
          isSaving={isSaving}
          onSave={handleSave}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={true}
          canRedo={false}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
        />

        <main className="flex-1 flex justify-center overflow-hidden">
          <div className="flex w-full max-w-7xl overflow-hidden">
            {/* Summary Panel - masqué sur mobile */}
            <div className="hidden sm:block p-4 border-r shrink-0">
              <SummaryPanel
                acts={mockActs}
                characters={mockCharacters}
                activeSection={activeSection}
                onSectionClick={setActiveSection}
                onCharacterClick={handleCharacterClick}
              />
            </div>

            {/* Colonne éditeur */}
            <div className="flex-1 flex flex-col min-w-0 max-w-3xl">
              {/* Zone CodeMirror */}
              <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full bg-muted/20 rounded-lg border flex items-center justify-center text-muted-foreground">
                  Zone éditeur (CodeMirror)
                </div>
              </div>

              {/* Barre syntaxe */}
              <SyntaxBar
                onInsert={handleInsertSyntax}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={true}
                canRedo={false}
              />
            </div>

            {/* Preview - masquée sur mobile */}
            {showPreview && (
              <div className="hidden sm:block flex-1 p-4 border-l min-w-0">
                <div className="h-full bg-white rounded-lg border flex items-center justify-center text-muted-foreground">
                  Zone preview
                </div>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
