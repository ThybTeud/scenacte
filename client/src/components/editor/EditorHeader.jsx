import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Save,
  Undo2,
  Redo2,
  Loader2,
  WifiOff,
  ChartPie,
  History,
  FileText,
  Download,
  Dot,
  Minus,
} from "lucide-react";
import { HeaderUserMenu } from "@/components/editor/HeaderUserMenu";

export function EditorHeader({
  title,
  onTitleChange,
  isSaving,
  onCreateVersion,
  hasUnsavedChanges,
  isOnline,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenStats,
  onOpenVersions,
  onOpenPageSettings,
  onOpenExport,
  user,
  onLogout,
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 border-b-2 border-border bg-sidebar">
      {/* Logo + séparateur */}
      <Link to="/library" className="shrink-0">
        <img
          src="/logo_long.png"
          alt="Scenacte"
          className="h-7 w-auto object-contain hidden md:block"
        />
        <img
          src="/logo_short.png"
          alt="Scenacte"
          className="h-7 w-auto object-contain md:hidden"
        />
      </Link>
      <Dot className="h-6 w-6 shrink-0" />

      {/* Titre + indicateurs */}
      <div className="flex items-center gap-2 min-w-0">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="max-w-xs h-9 bg-white"
          placeholder="Titre de la pièce"
        />
        {!isOnline && (
          <Badge variant="outline" className="text-xs shrink-0">
            <WifiOff className="h-3 w-3 mr-1" />
            Hors ligne
          </Badge>
        )}
      </div>

      {/* Boutons édition */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Button
                variant="secondary"
                size="icon"
                onClick={onCreateVersion}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              {!isSaving && hasUnsavedChanges && (
                <div
                  className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-sidebar"
                  title="Modifications non versionnées"
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>Sauvegarder</TooltipContent>
        </Tooltip>

        <div className="hidden sm:flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                className="rounded-r-none border-r-0"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Annuler</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                className="rounded-l-none"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
          </TooltipTrigger>
          <TooltipContent>Rétablir</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Boutons outils */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={onOpenStats}>
              <ChartPie className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Statistiques</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={onOpenVersions}>
              <History className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Historique</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={onOpenPageSettings}>
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mise en page</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="default" onClick={onOpenExport}>
              <Download className="h-4 w-4" />Exporter
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exporter</TooltipContent>
        </Tooltip>
      </div>

      <Minus className="h-6 w-6 shrink-0 rotate-90" />

      {/* Avatar utilisateur */}
      <HeaderUserMenu user={user} onLogout={onLogout} />
    </header>
  );
}
