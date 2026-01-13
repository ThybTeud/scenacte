import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Undo2, Redo2, BookOpen, CheckCircle, Loader2 } from "lucide-react"

export function EditorHeader({
  title,
  onTitleChange,
  isSaving,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showPreview,
  onTogglePreview
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      {/* Left section */}
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="max-w-sm h-9"
          placeholder="Titre de la pièce"
        />
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
        )}
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onSave} title="Sauvegarder">
          <Save className="h-4 w-4" />
        </Button>

        {/* Undo/Redo - masqués sur mobile */}
        <Separator orientation="vertical" className="h-4 hidden sm:block" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Annuler"
          className="hidden sm:inline-flex"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="Rétablir"
          className="hidden sm:inline-flex"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        {/* Toggle preview - masqué sur mobile */}
        <Separator orientation="vertical" className="h-4 hidden sm:block" />
        <Button
          variant={showPreview ? "secondary" : "ghost"}
          size="icon"
          onClick={onTogglePreview}
          title="Aperçu"
          className="hidden sm:inline-flex"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
