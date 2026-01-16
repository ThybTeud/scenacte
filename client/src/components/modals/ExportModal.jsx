import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, FileCode, File, Download, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { PdfPreview } from "@/components/pdf/PdfPreview";
import { printPdf } from "@/utils/pdfExport";

const FORMATS = [
    { id: "pdf", label: "PDF", icon: FileText, disabled: false },
    { id: "md", label: "Markdown", icon: FileCode, disabled: true },
    { id: "txt", label: "Texte", icon: File, disabled: true },
];

const ZOOM_LEVELS = [50, 75, 100, 125, 150];
const DEFAULT_ZOOM = 75;

function FormatToggle({ formats, value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            {formats.map((format) => (
                <button
                    key={format.id}
                    type="button"
                    onClick={() => !format.disabled && onChange(format.id)}
                    disabled={format.disabled}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        value === format.id && "bg-primary text-primary-foreground hover:bg-primary/90",
                        format.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                >
                    <format.icon size={16} />
                    <span>{format.label}</span>
                </button>
            ))}
        </div>
    );
}

function ZoomControls({ zoom, onZoomChange, pageCount }) {
    const zoomIn = () => {
        const currentIndex = ZOOM_LEVELS.indexOf(zoom);
        if (currentIndex < ZOOM_LEVELS.length - 1) {
            onZoomChange(ZOOM_LEVELS[currentIndex + 1]);
        }
    };

    const zoomOut = () => {
        const currentIndex = ZOOM_LEVELS.indexOf(zoom);
        if (currentIndex > 0) {
            onZoomChange(ZOOM_LEVELS[currentIndex - 1]);
        }
    };

    return (
        <div className="flex items-center justify-between px-2 py-1.5 bg-muted/50 rounded-t-md border-b">
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={zoomOut}
                    disabled={zoom <= ZOOM_LEVELS[0]}
                    className="h-7 w-7"
                >
                    <ZoomOut size={14} />
                </Button>
                <span className="text-xs font-medium w-10 text-center tabular-nums">
                    {zoom}%
                </span>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={zoomIn}
                    disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                    className="h-7 w-7"
                >
                    <ZoomIn size={14} />
                </Button>
            </div>
            {pageCount > 0 && (
                <span className="text-xs text-muted-foreground">
                    {pageCount} page{pageCount > 1 ? "s" : ""}
                </span>
            )}
        </div>
    );
}

export default function ExportModal({
    open,
    onOpenChange,
    htmlContent,
    playTitle,
    playSubtitle,
}) {
    const [format, setFormat] = useState("pdf");
    const [pageCount, setPageCount] = useState(0);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const iframeRef = useRef(null);

    const handleDownload = () => {
        printPdf(iframeRef);
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
                showCloseButton={true}
            >
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle>Exporter la pièce</DialogTitle>
                </DialogHeader>

                {/* Content */}
                <div className="flex flex-1 min-h-0">
                    {/* Colonne gauche - Options */}
                    <div className="w-[140px] flex flex-col border-r bg-muted/30 shrink-0">
                        <div className="flex-1 p-4">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Format
                            </label>
                            <div className="mt-3">
                                <FormatToggle
                                    formats={FORMATS}
                                    value={format}
                                    onChange={setFormat}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="p-4 space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={handleClose}
                            >
                                Annuler
                            </Button>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={handleDownload}
                                disabled={format !== "pdf"}
                            >
                                <Download size={14} />
                                Télécharger
                            </Button>
                        </div>
                    </div>

                    {/* Colonne droite - Preview */}
                    <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
                        {format === "pdf" && htmlContent ? (
                            <>
                                <ZoomControls
                                    zoom={zoom}
                                    onZoomChange={setZoom}
                                    pageCount={pageCount}
                                />
                                <div className="flex-1 min-h-0 overflow-auto p-4">
                                    <PdfPreview
                                        ref={iframeRef}
                                        htmlContent={htmlContent}
                                        playTitle={playTitle}
                                        playSubtitle={playSubtitle}
                                        template="classic"
                                        pageFormat="A4"
                                        zoom={zoom}
                                        onPagesRendered={setPageCount}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                {format !== "pdf" ? (
                                    <p className="text-sm">Export {format.toUpperCase()} bientôt disponible</p>
                                ) : (
                                    <p className="text-sm">Aucun contenu à afficher</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
