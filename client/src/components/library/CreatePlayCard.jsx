import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CreatePlayCard({ onClick }) {
  return (
    <Card
      className="cursor-pointer border-dashed hover:border-primary hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[180px] gap-4">
        <p className="text-sm text-muted-foreground text-center">
          Créer une nouvelle pièce
        </p>
        <Button variant="outline" size="icon" className="rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
