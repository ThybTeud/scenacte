import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Undo2, Redo2 } from "lucide-react"

const syntaxButtons = [
  { label: '#Acte', short: '#', syntax: '#', tooltip: 'Insérer un acte' },
  { label: '##Scène', short: '##', syntax: '##', tooltip: 'Insérer une scène' },
  { label: '@Personnage', short: '@', syntax: '@', tooltip: 'Insérer un personnage' },
  { label: '(Didascalie)', short: '()', syntax: '(', tooltip: 'Insérer une didascalie' },
  { label: 'Dialogue', short: 'D', syntax: '', tooltip: 'Insérer un dialogue' },
]

export function SyntaxBar({ onInsert, onUndo, onRedo, canUndo = true, canRedo = false }) {
  return (
    <div className="flex items-center gap-2 p-2 border-t bg-muted/30">
      {/* Boutons syntaxe */}
      <div className="flex items-center justify-between gap-2 flex-1 sm:flex-initial sm:gap-2">
        {syntaxButtons.map((btn) => (
          <Button
            key={btn.label}
            variant="outline"
            onClick={() => onInsert(btn.syntax)}
            title={btn.tooltip}
            className="flex-1 sm:flex-initial sm:min-w-[100px] h-10 sm:h-9 text-sm"
          >
            <span className="sm:hidden">{btn.short}</span>
            <span className="hidden sm:inline">{btn.label}</span>
          </Button>
        ))}
      </div>

      {/* Undo/Redo - visible uniquement sur mobile */}
      <div className="flex items-center gap-1 sm:hidden">
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Annuler"
          className="h-10 w-10"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="Rétablir"
          className="h-10 w-10"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
