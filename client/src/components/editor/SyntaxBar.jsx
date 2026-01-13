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
    <div className="flex items-center gap-1 sm:gap-2 p-2 border-t bg-muted/30">
      {/* Boutons syntaxe */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1">
        {syntaxButtons.map((btn) => (
          <Button
            key={btn.label}
            variant="outline"
            size="sm"
            onClick={() => onInsert(btn.syntax)}
            title={btn.tooltip}
            className="flex-1 h-9 px-2 md:px-3 text-xs md:text-sm"
          >
            {/* Mobile/Tablet : raccourci */}
            <span className="md:hidden">{btn.short}</span>
            {/* Desktop : label complet */}
            <span className="hidden md:inline">{btn.label}</span>
          </Button>
        ))}
      </div>

      {/* Undo/Redo - visible uniquement sur mobile/tablet */}
      <div className="flex items-center gap-1 md:hidden shrink-0">
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Annuler"
          className="h-9 w-9"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="Rétablir"
          className="h-9 w-9"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
