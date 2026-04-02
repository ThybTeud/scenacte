import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function CreatePlayCard({ onClick }) {
  return (
    <Card
      className="gap-0 py-0 h-full border-dashed border-border hover:border-black hover:shadow-brutal transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center flex-1 py-4 ">
        <Plus className="h-4 w-4" />
        <p className="text-sm text-muted-foreground text-center">
          Nouvelle pièce
        </p>
      </CardContent>
    </Card>
  );
}
