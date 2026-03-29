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
import { Input } from "@/components/ui/input";
import { BookCheck, Minus, Plus, Download } from "lucide-react";
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

    // Navigation vers une page spécifique
    const scrollToPage = (pageNum) => {
        const iframe = iframeRef.current;
        const pages = iframe?.contentDocument?.querySelectorAll(".pagedjs_page");
        if (pages?.[pageNum - 1]) {
            pages[pageNum - 1].scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handlePageInputCommit = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 1 && value <= pageCount) {
            scrollToPage(value);
        } else {
            e.target.value = currentPage;
        }
    };

    const handleZoomInputCommit = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 50 && value <= 150) {
            setZoomScale(value / 100);
        } else {
            e.target.value = displayZoom;
        }
    };

    const handleInputKeyDown = () => (e) => {
        if (e.key === "Enter" || e.key === "Escape") {
            e.target.blur();
        }
    };

    const templateLabel = presetId ? getPreset(presetId).name : "Par défaut";

    const compactInputClasses = "h-6 !w-10 px-1 text-center text-sm tabular-nums";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[calc(100%-2rem)] md:max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
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
                        <div className="space-y-5">
                            {/* Carte settings — infos + action groupées */}
                            <div className="rounded-sm border-2 border-border overflow-hidden text-sm">
                                <div className="flex items-center justify-between px-3 py-2.5">
                                    <span className="text-muted-foreground">Format</span>
                                    <Badge variant="outline">{pageFormat}</Badge>
                                </div>
                                <div className="border-t border-border flex items-center justify-between px-3 py-2.5">
                                    <span className="text-muted-foreground">Template</span>
                                    <span className="font-medium text-xs truncate max-w-[90px]">{templateLabel}</span>
                                </div>
                                <button
                                    className="border-t-2 border-border flex items-center gap-2 px-3 py-2.5 w-full bg-white hover:bg-surface-hover active:bg-surface-active transition-all duration-150 text-sm font-medium cursor-pointer"
                                    onClick={handleOpenLayoutModal}
                                >
                                    <BookCheck size={14} />
                                    Mise en page
                                </button>
                            </div>

                            {/* Carte navigation — page + zoom */}
                            <div className="rounded-sm border-2 border-border overflow-hidden text-sm">
                                {/* Page */}
                                <div className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground">
                                    <span>Page</span>
                                    <Input
                                        key={currentPage}
                                        type="text"
                                        inputMode="numeric"
                                        defaultValue={currentPage}
                                        onBlur={handlePageInputCommit}
                                        onKeyDown={handleInputKeyDown()}
                                        onFocus={(e) => e.target.select()}
                                        className={compactInputClasses}
                                    />
                                    <span>/ {pageCount > 0 ? pageCount : "..."}</span>
                                </div>
                                {/* Zoom slider */}
                                <div className="border-t border-border flex items-center gap-1 px-1.5 py-1.5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 shrink-0"
                                        onClick={() => adjustZoom(-0.1)}
                                    >
                                        <Minus size={12} />
                                    </Button>
                                    <Slider
                                        value={[displayZoom]}
                                        min={50}
                                        max={150}
                                        step={5}
                                        onValueChange={handleSliderChange}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 shrink-0"
                                        onClick={() => adjustZoom(0.1)}
                                    >
                                        <Plus size={12} />
                                    </Button>
                                </div>
                                {/* Zoom value */}
                                <div className="border-t border-border flex items-center justify-center gap-1 px-3 py-1.5 text-muted-foreground">
                                    <Input
                                        key={displayZoom}
                                        type="text"
                                        inputMode="numeric"
                                        defaultValue={displayZoom}
                                        onBlur={handleZoomInputCommit}
                                        onKeyDown={handleInputKeyDown()}
                                        onFocus={(e) => e.target.select()}
                                        className={compactInputClasses}
                                        aria-label="Zoom %"
                                    />
                                    <span>%</span>
                                </div>
                            </div>
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
                    <div className="flex md:hidden items-center gap-1.5 px-3 py-2 border-b bg-muted/30 shrink-0 text-sm text-muted-foreground">
                        <span>Page</span>
                        <Input
                            key={`m-page-${currentPage}`}
                            type="text"
                            inputMode="numeric"
                            defaultValue={currentPage}
                            onBlur={handlePageInputCommit}
                            onKeyDown={handleInputKeyDown()}
                            onFocus={(e) => e.target.select()}
                            className={compactInputClasses}
                        />
                        <span>/ {pageCount > 0 ? pageCount : "..."}</span>
                        <span className="mx-1 text-border">·</span>
                        <Input
                            key={`m-zoom-${displayZoom}`}
                            type="text"
                            inputMode="numeric"
                            defaultValue={displayZoom}
                            onBlur={handleZoomInputCommit}
                            onKeyDown={handleInputKeyDown()}
                            onFocus={(e) => e.target.select()}
                            className={compactInputClasses}
                            aria-label="Zoom %"
                        />
                        <span>%</span>
                        <span className="flex-1" />
                        <Button
                            variant="secondary"
                            size="icon"
                            className="shrink-0 size-8"
                            onClick={handleOpenLayoutModal}
                        >
                            <BookCheck size={14} />
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
                    <div className="flex-1 min-h-0 overflow-hidden bg-[#d4d4d4] flex">
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
            </DialogContent>
        </Dialog>
    );
}
