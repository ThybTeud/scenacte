import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, History, Trash2 } from "lucide-react"

const formatDate = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(dateObj)
}

export function PlayCard({ play, onClick, onRename, onDelete, onVersions }) {
  const { title, subtitle, updatedAt, charactersCount, scenesCount, repliquesCount } = play

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
        {subtitle && (
          <CardDescription>{subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {formatDate(updatedAt)} · {charactersCount} perso · {scenesCount} scènes · {repliquesCount} répl
        </p>
      </CardContent>
    </Card>
  )
}
