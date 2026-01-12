import { Button } from "@/components/ui/button"

const syntaxButtons = [
  { label: '#Acte', syntax: '#', tooltip: 'Insérer un acte' },
  { label: '##Scène', syntax: '##', tooltip: 'Insérer une scène' },
  { label: '@Personnage', syntax: '@', tooltip: 'Insérer un personnage' },
  { label: '(Didascalie)', syntax: '(', tooltip: 'Insérer une didascalie' },
  { label: 'Dialogue', syntax: '', tooltip: 'Insérer un dialogue' },
]

export function SyntaxBar({ onInsert }) {
  return (
    <div className="flex items-center gap-2 p-2 border-t bg-muted/30">
      {syntaxButtons.map((btn) => (
        <Button
          key={btn.label}
          variant="outline"
          size="sm"
          onClick={() => onInsert(btn.syntax)}
          title={btn.tooltip}
          className="text-xs"
        >
          {btn.label}
        </Button>
      ))}
    </div>
  )
}
