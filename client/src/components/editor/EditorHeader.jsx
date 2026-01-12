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

      <div className="flex items-center gap-2 flex-1">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="max-w-sm h-8 border-none shadow-none focus-visible:ring-0"
          placeholder="Titre de la pièce"
        />
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onSave} title="Sauvegarder">
          <Save className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title="Annuler">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title="Rétablir">
          <Redo2 className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant={showPreview ? "secondary" : "ghost"}
          size="icon"
          onClick={onTogglePreview}
          title="Aperçu"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
