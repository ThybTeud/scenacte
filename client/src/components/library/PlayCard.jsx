import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, History, Trash2, ExternalLink, Download, SquarePen } from "lucide-react"

const formatDate = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(dateObj)
}

export function PlayCard({ play, onOpen, onExport, onRename, onDelete, onVersions }) {
  const { title, subtitle, updatedAt, charactersCount, scenesCount, repliquesCount } = play

  return (
    <Card className="flex flex-col h-53 gap-0 p-2 rounded-sm border-border shadow-brutal">
      <CardHeader className="flex-1 gap-0 p-2">
        <CardTitle className="text-base font-semibold line-clamp-2">{title}</CardTitle>
        {subtitle && (
          <CardDescription className="line-clamp-1">{subtitle}</CardDescription>
        )}
        <p className="text-xs text-muted-foreground pt-2">
          {formatDate(updatedAt)}
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-2 px-2">
        {/* Stats */}
        <div className="flex justify-between py-2">
          <div className="text-center">
            <p className="text-xl font-semibold text-act">{scenesCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Scènes</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-muted-foreground">{repliquesCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Répliques</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-character">{charactersCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Personnages</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 items-center justify-between pb-2">
          <Button size="sm" className="flex-1 px-4 py-2 leading-12 rounded-sm" onClick={() => onOpen?.(play)}>
            {/* <SquarePen className="h-4 w-4" /> */}
            Ouvrir
          </Button>
          
          {/* Button Group : Exporter + Dropdown */}
          <div className="flex">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-r-none border-r px-4 py-2"
              onClick={() => onExport?.(play)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="rounded-l-none border-l px-4 py-2 leading-12 w-4">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRename?.(play)}>
                  <Pencil className="h-4 w-4" />
                  Renommer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onVersions?.(play)}>
                  <History className="h-4 w-4" />
                  Versions
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(play)}>
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}