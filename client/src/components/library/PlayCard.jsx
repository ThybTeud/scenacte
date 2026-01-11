import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"

const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date)
}

export function PlayCard({ play, onClick }) {
  const { title, subtitle, updatedAt, charactersCount, scenesCount, repliquesCount } = play

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              console.log('More options for', play.id)
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
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
