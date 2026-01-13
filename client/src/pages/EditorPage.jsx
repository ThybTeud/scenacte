import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EditorSidebar } from "@/components/sidebar"
import { EditorHeader } from "@/components/editor/EditorHeader"
import { SyntaxBar } from "@/components/editor/SyntaxBar"

// TODO: Remplacer par données réelles depuis API
const MOCK_ACTS = [
  {
    id: 'act-1',
    title: 'Acte 1',
    scenes: [
      { id: 'scene-1-1', title: 'Scène 1' },
      { id: 'scene-1-2', title: 'Scène 2' },
      { id: 'scene-1-3', title: 'Scène 3' },
    ],
  },
  {
    id: 'act-2',
    title: 'Acte 2',
    scenes: [
      { id: 'scene-2-1', title: 'Scène 1' },
      { id: 'scene-2-2', title: 'Scène 2' },
    ],
  },
]

const MOCK_CHARACTERS = [
  { id: '1', name: 'Argante' },
  { id: '2', name: 'Géronte' },
  { id: '3', name: 'Zélide' },
]

const MOCK_STATS = {
  scenes: 12,
  repliques: 156,
  characters: 5,
}

export default function EditorPage() {
  const { id } = useParams()

  // État du document
  const [title, setTitle] = useState('Ma pièce de théâtre')
  const [activeSection, setActiveSection] = useState('scene-1-2')

  // État UI
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  // TODO: Implémenter avec l'état réel de l'éditeur
  const canUndo = true
  const canRedo = false

  const handleSave = () => {
    setIsSaving(true)
    // TODO: Appel API sauvegarde
    setTimeout(() => setIsSaving(false), 1000)
  }

  const handleUndo = () => {
    // TODO: Connecter à CodeMirror
    console.log('undo')
  }

  const handleRedo = () => {
    // TODO: Connecter à CodeMirror
    console.log('redo')
  }

  const handleInsertSyntax = (syntax) => {
    // TODO: Connecter à CodeMirror
    console.log('Insert syntax:', syntax)
  }

  const handleCharacterClick = (name) => {
    // TODO: Insérer @name dans CodeMirror
    console.log('Insert character:', name)
  }

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId)
    // TODO: Scroller vers la section dans CodeMirror
  }

  return (
    <SidebarProvider>
      <EditorSidebar
        stats={MOCK_STATS}
        acts={MOCK_ACTS}
        characters={MOCK_CHARACTERS}
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
        onCharacterClick={handleCharacterClick}
      />

      <SidebarInset>
        <EditorHeader
          title={title}
          onTitleChange={setTitle}
          isSaving={isSaving}
          onSave={handleSave}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(prev => !prev)}
        />

        <main className="flex-1 flex justify-center overflow-hidden p-4">
          <div className="flex w-full max-w-5xl gap-4">
            {/* Colonne éditeur */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 w-full max-w-3xl mx-auto overflow-hidden">
                <div className="h-full bg-muted/20 rounded-lg border flex items-center justify-center text-muted-foreground">
                  Zone éditeur (CodeMirror)
                </div>
              </div>

              <div className="w-full max-w-3xl mx-auto mt-2">
                <SyntaxBar
                  onInsert={handleInsertSyntax}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </div>
            </div>

            {/* Preview - masquée sous md */}
            {showPreview && (
              <div className="hidden md:flex flex-1 min-w-0">
                <div className="h-full w-full bg-white rounded-lg border flex items-center justify-center text-muted-foreground">
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
