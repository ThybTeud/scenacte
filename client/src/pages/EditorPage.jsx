import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EditorSidebar } from "@/components/editor/EditorSidebar"
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

  return (
    <SidebarProvider>
      <EditorSidebar />
      <SidebarInset>
        <EditorHeader
          title={title}
          onTitleChange={setTitle}
          isSaving={isSaving}
          onSave={handleSave}
          onUndo={() => console.log('undo')}
          onRedo={() => console.log('redo')}
          canUndo={true}
          canRedo={false}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
        />

        <main className="flex flex-1 overflow-hidden">
          {/* Summary Panel */}
          <div className="p-4 border-r">
            <SummaryPanel
              acts={mockActs}
              characters={mockCharacters}
              activeSection={activeSection}
              onSectionClick={setActiveSection}
              onCharacterClick={handleCharacterClick}
            />
          </div>

          {/* Editor + Preview */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex overflow-hidden">
              {/* Editor area */}
              <div className="flex-1 p-4">
                <div className="h-full bg-muted/20 rounded-lg border flex items-center justify-center text-muted-foreground">
                  Zone éditeur (CodeMirror)
                </div>
              </div>

              {/* Preview area */}
              {showPreview && (
                <div className="w-1/2 p-4 border-l">
                  <div className="h-full bg-white rounded-lg border flex items-center justify-center text-muted-foreground">
                    Zone preview
                  </div>
                </div>
              )}
            </div>

            {/* Syntax bar */}
            <SyntaxBar onInsert={handleInsertSyntax} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
