import { useState, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, Minus, Plus, Download } from "lucide-react";
import { PdfPreview } from "@/components/pdf/PdfPreview";
import { printPdf } from "@/utils/pdfExport";
import { getPreset } from "@/config/template-presets";

/**
 * Modal d'export PDF
 * @param {Object} props
 * @param {boolean} props.open - Modal ouvert ou ferme
 * @param {Function} props.onOpenChange - Callback pour changer l'etat du modal
 * @param {string} props.htmlContent - Contenu HTML de la piece
 * @param {string} props.playTitle - Titre de la piece
 * @param {string} [props.playSubtitle] - Sous-titre de la piece
 * @param {string} [props.pageFormat='A5'] - Format de page (A4 ou A5)
 * @param {string} props.presetId - ID du preset à utiliser
 * @param {Function} [props.onOpenLayoutModal] - Callback pour ouvrir le modal de mise en page
 */
export default function ExportModal({
    open,
    onOpenChange,
    htmlContent,
    playTitle,
    playSubtitle,
    pageFormat = "A5",
    presetId,
    onOpenLayoutModal,
}) {
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [zoomScale, setZoomScale] = useState(null);
    const fitScaleRef = useRef(0.7);
    const iframeRef = useRef(null);

    const handleDownload = () => {
        printPdf(iframeRef);
    };

    const handleOpenLayoutModal = () => {
        onOpenLayoutModal?.();
    };

    const handleFitScaleComputed = useCallback((value) => {
        fitScaleRef.current = value;
    }, []);

    const adjustZoom = (delta) => {
        setZoomScale((prev) => {
            const current = prev ?? fitScaleRef.current;
            return Math.min(1.5, Math.max(0.5, current + delta));
        });
    };

    const handleSliderChange = ([value]) => {
        setZoomScale(value / 100);
    };

    const displayZoom = zoomScale !== null
        ? Math.round(zoomScale * 100)
        : Math.round(fitScaleRef.current * 100);

    const templateLabel = presetId ? getPreset(presetId).name : "Par défaut";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[calc(100%-2rem)] sm:max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
            >
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle>Exporter la pièce</DialogTitle>
                    <DialogDescription>
                        Prévisualisez et téléchargez votre pièce au format PDF.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
                    {/* Sidebar desktop */}
                    <div className="hidden md:flex md:flex-col md:w-52 md:border-r bg-muted/30 shrink-0 p-4 justify-between">
                        <div className="space-y-4">
                            {/* Infos document — carte unique avec séparateurs */}
                            <div className="rounded-sm border-2 border-border overflow-hidden text-sm">
                                <div className="flex items-center justify-between px-3 py-2.5">
                                    <span className="text-muted-foreground">Format</span>
                                    <Badge variant="outline">{pageFormat}</Badge>
                                </div>
                                <div className="border-t border-border flex items-center justify-between px-3 py-2.5">
                                    <span className="text-muted-foreground">Template</span>
                                    <span className="font-medium text-xs truncate max-w-[90px]">{templateLabel}</span>
                                </div>
                                <div className="border-t border-border flex items-center justify-between px-3 py-2.5">
                                    <span className="text-muted-foreground">Pages</span>
                                    <span className="font-medium">{pageCount > 0 ? pageCount : "..."}</span>
                                </div>
                            </div>

                            {/* Bouton Mise en page */}
                            <Button
                                variant="secondary"
                                className="w-full justify-between"
                                onClick={handleOpenLayoutModal}
                            >
                                Mise en page
                                <SlidersHorizontal size={16} />
                            </Button>
                        </div>

                        {/* Bouton Télécharger */}
                        <Button
                            className="w-full mt-auto"
                            onClick={handleDownload}
                        >
                            <Download size={16} />
                            Télécharger
                        </Button>
                    </div>

                    {/* Barre mobile */}
                    <div className="flex md:hidden items-center gap-2 px-3 py-2 border-b bg-muted/30 shrink-0">
                        <Badge variant="outline">{pageFormat}</Badge>
                        <span className="text-xs text-muted-foreground truncate flex-1">
                            {templateLabel}
                        </span>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="shrink-0 size-8"
                            onClick={handleOpenLayoutModal}
                        >
                            <SlidersHorizontal size={14} />
                        </Button>
                        <Button
                            size="sm"
                            className="shrink-0"
                            onClick={handleDownload}
                        >
                            <Download size={14} />
                            Télécharger
                        </Button>
                    </div>

                    {/* Preview */}
                    <div className="flex-1 min-h-0 overflow-hidden bg-[#d4d4d4] flex flex-col">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between border-b px-3 py-1.5 bg-muted/50 shrink-0">
                            <span className="text-xs text-muted-foreground">
                                {pageCount > 0
                                    ? `Page ${currentPage} / ${pageCount}`
                                    : "Chargement..."}
                            </span>

                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => adjustZoom(-0.1)}
                                >
                                    <Minus size={14} />
                                </Button>
                                <Slider
                                    value={[displayZoom]}
                                    min={50}
                                    max={150}
                                    step={5}
                                    onValueChange={handleSliderChange}
                                    className="w-24"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => adjustZoom(0.1)}
                                >
                                    <Plus size={14} />
                                </Button>
                                <span className="text-xs text-muted-foreground w-9 text-right tabular-nums">
                                    {zoomScale !== null ? `${displayZoom}%` : "Auto"}
                                </span>
                            </div>
                        </div>

                        {/* PdfPreview */}
                        <div className="flex-1 min-h-0 overflow-hidden flex">
                            {htmlContent ? (
                                <PdfPreview
                                    ref={iframeRef}
                                    htmlContent={htmlContent}
                                    playTitle={playTitle}
                                    playSubtitle={playSubtitle}
                                    pageFormat={pageFormat}
                                    presetId={presetId}
                                    onPagesRendered={setPageCount}
                                    zoomScale={zoomScale}
                                    onPageChange={setCurrentPage}
                                    onFitScaleComputed={handleFitScaleComputed}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    <p className="text-sm">
                                        Aucun contenu à afficher
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
