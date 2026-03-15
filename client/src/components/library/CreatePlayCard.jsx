import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CreatePlayCard({ onClick }) {
  return (
    <Card
      className="flex flex-col h-48 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center flex-1 gap-3">
        <Button variant="outline" size="icon" className="rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Nouvelle pièce
        </p>
      </CardContent>
    </Card>
  )
}