import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { LibrarySidebar } from "@/components/sidebar"
import { PlayCard } from "@/components/library/PlayCard"
import { CreatePlayCard } from "@/components/library/CreatePlayCard"

const mockPlays = [
  {
    id: '1',
    title: 'Le Malade imaginaire',
    subtitle: 'Comédie-ballet',
    updatedAt: new Date('2025-01-12'),
    charactersCount: 5,
    scenesCount: 8,
    repliquesCount: 124
  },
  {
    id: '2',
    title: 'Phèdre',
    subtitle: null,
    updatedAt: new Date('2025-01-08'),
    charactersCount: 3,
    scenesCount: 5,
    repliquesCount: 89
  }
]

export default function LibraryPage() {
  return (
    <SidebarProvider>
      <LibrarySidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sm:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Bibliothèque</h1>
        </header>

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-6 hidden sm:block">Bibliothèque</h1>
          {/* Actions row */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Recherche + Filtres */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 flex-1 min-w-0">
              <div className="relative w-full sm:w-80 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une pièce..."
                  className="pl-9 w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Filtre</Button>
                <Button variant="outline" size="sm">Filtre</Button>
              </div>
            </div>

            {/* CTA */}
            <Button className="w-full sm:w-auto shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle pièce
            </Button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockPlays.map(play => (
              <PlayCard
                key={play.id}
                play={play}
                onClick={() => console.log('Navigate to', play.id)}
              />
            ))}
            <CreatePlayCard onClick={() => console.log('Create new play')} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
