import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Undo2,
  Redo2,
  MoreVertical,
  ChartPie,
  History,
  BookCheck,
  Download,
} from "lucide-react";

const syntaxButtons = [
  {
    label: "#",
    formatType: "heading1",
    className: "bg-primary font-bold hover:bg-primary/90",
  },
  {
    label: "##",
    formatType: "heading2",
    className: "bg-primary font-bold hover:bg-primary/90",
  },
  {
    label: "@",
    formatType: "personnage",
    className: "bg-blue-600 font-bold hover:bg-blue-700",
  },
  {
    label: "()",
    formatType: "didascalie",
    className: "bg-gray-600 italic hover:bg-gray-700",
  },
];

export function SyntaxBar({
  onToggleFormat,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenStats,
  onOpenVersions,
  onOpenPageSettings,
  onOpenExport,
}) {
  return (
    <div className="flex items-center justify-between px-4 pb-4 md:hidden shrink-0">
      {/* Boutons syntaxe */}
      <div className="flex items-center gap-2">
        {syntaxButtons.map((btn) => (
          <Button
            key={btn.formatType}
            variant="secondary"
            size="icon"
            depth="raised"
            onClick={() => onToggleFormat(btn.formatType)}
            className={`text-primary-foreground text-sm ${btn.className}`}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Undo / Redo / More */}
      <div className="flex items-center gap-2">
        <div className="">
          <Button
            variant="secondary"
            size="icon"
            depth="raised"
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-r-none border-r"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            depth="raised"
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded-l-none border-l"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              depth="raised"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            <DropdownMenuItem onClick={onOpenStats}>
              <ChartPie className="h-4 w-4 mr-2" />
              Statistiques
            </DropdownMenuItem>
            {onOpenVersions && (
              <DropdownMenuItem onClick={onOpenVersions}>
                <History className="h-4 w-4 mr-2" />
                Historique
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onOpenPageSettings}>
              <BookCheck className="h-4 w-4 mr-2" />
              Mise en page
            </DropdownMenuItem>
            {onOpenExport ? (
              <DropdownMenuItem onClick={onOpenExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled>
                <Download className="h-4 w-4 mr-2" />
                Exporter (compte requis)
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
