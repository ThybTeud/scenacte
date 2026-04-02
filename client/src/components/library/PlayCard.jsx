import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, History, Trash2, Download } from "lucide-react";

const formatDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
};

export function PlayCard({
  play,
  onOpen,
  onExport,
  onRename,
  onDelete,
  onVersions,
}) {
  const { title, updatedAt, charactersCount, scenesCount, repliquesCount } =
    play;

  return (
    <Card className="gap-0 py-0 border-black shadow-brutal">
      {/* ZONE 1 — Titre + date */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-md font-semibold truncate leading-snug">{title}</p>
        </div>
      </div>

      {/* ZONE 2 — Stats */}
      <div className="px-4 pb-4 space-y-3">
        <p className="text-xs text-muted-foreground tracking-wide">
          {scenesCount ?? 0} scènes&ensp;·&ensp;{repliquesCount ?? 0}{" "}
          répl.&ensp;·&ensp;{charactersCount ?? 0} pers.
        </p>
        <p className="text-[11px] text-muted-foreground/50 shrink-0 whitespace-nowrap pt-0.5">
            {formatDate(updatedAt)}
          </p>
      </div>

      {/* ZONE 3 — Actions : bouton Ouvrir + button group collé */}
      <div className="flex gap-2 px-4 pb-4 pt-4 border-t border-border">
        <Button
          variant="default"
          className="flex-1"
          onClick={() => onOpen?.(play)}
        >
          Ouvrir
        </Button>

        {/* Button group collé : Download + Menu contextuel */}
        <div className="flex">
          <Button
            variant="secondary"
            className="border-r rounded-r-none"
            onClick={(e) => {
              e.stopPropagation();
              onExport?.(play);
            }}
            aria-label="Exporter"
          >
            <Download className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="border-l rounded-l-none"
                onClick={(e) => e.stopPropagation()}
                aria-label="Plus d'options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRename?.(play)}>
                <Pencil className="h-4 w-4" /> Renommer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onVersions?.(play)}>
                <History className="h-4 w-4" /> Versions
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete?.(play)}
              >
                <Trash2 className="h-4 w-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
