import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

export function SummaryPanel({
  acts,
  characters,
  activeSection,
  onSectionClick,
  onCharacterClick
}) {
  return (
    <div className="w-48 shrink-0 flex flex-col gap-4 overflow-y-auto">
      {/* Sommaire */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wide">
            Sommaire
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <nav className="space-y-1">
            {acts.map((act) => (
              <div key={act.id}>
                <button
                  onClick={() => onSectionClick(act.id)}
                  className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-muted ${
                    activeSection === act.id ? 'bg-muted font-medium' : ''
                  }`}
                >
                  {act.title}
                </button>
                {act.scenes?.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => onSectionClick(scene.id)}
                    className={`w-full text-left pl-4 pr-2 py-1 text-sm rounded hover:bg-muted ${
                      activeSection === scene.id ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    {scene.title}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Personnages */}
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wide">
            Personnages
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <div className="space-y-1">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => onCharacterClick(char.name)}
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted text-primary"
              >
                @{char.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
