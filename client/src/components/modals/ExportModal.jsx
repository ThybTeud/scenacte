import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";
import { PdfPreview } from "@/components/pdf/PdfPreview";
import { printPdf } from "@/utils/pdfExport";

export default function ExportModal({
    open,
    onOpenChange,
    htmlContent,
    playTitle,
    playSubtitle,
    pageFormat = "A4",
    template = "classic",
    onOpenLayoutModal,
}) {
    const [format, setFormat] = useState("pdf");
    const [pageCount, setPageCount] = useState(0);
    const iframeRef = useRef(null);

    const handleDownload = () => {
        printPdf(iframeRef);
    };

    const handleOpenLayoutModal = () => {
        onOpenLayoutModal?.();
        onOpenChange(false);
    };

    const templateLabel = template === "classic" ? "Classique" : "Moderne";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[768px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle>Exporter la pièce</DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-full md:w-48 flex flex-col md:border-r bg-muted/30 shrink-0 p-4 justify-between">
                        <div className="space-y-6">
                            {/* Section Document */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Document
                                </label>
                                <div className="mt-3 space-y-1 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Format : </span>
                                        <span>{pageFormat}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Template : </span>
                                        <span>{templateLabel}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Pages : </span>
                                        <span>{pageCount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bouton Mise en page */}
                            <Button
                                variant="outline"
                                className="w-full justify-between"
                                onClick={handleOpenLayoutModal}
                            >
                                Mise en page
                                <ExternalLink size={16} />
                            </Button>

                            {/* Section Format d'export */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Format d'export
                                </label>
                                <RadioGroup value={format} onValueChange={setFormat} className="mt-3">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="pdf" id="pdf" />
                                        <Label htmlFor="pdf">PDF</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-50">
                                        <RadioGroupItem value="word" id="word" disabled />
                                        <Label htmlFor="word">Word</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        {/* Bouton Télécharger */}
                        <Button
                            className="w-full mt-auto"
                            onClick={handleDownload}
                            disabled={format !== "pdf"}
                        >
                            Télécharger
                        </Button>
                    </div>

                    {/* Preview */}
                    <div className="flex-1 min-h-0 overflow-hidden bg-muted/20 flex max-md:absolute max-md:invisible max-md:pointer-events-none">
                        {format === "pdf" && htmlContent ? (
                            <PdfPreview
                                ref={iframeRef}
                                htmlContent={htmlContent}
                                playTitle={playTitle}
                                playSubtitle={playSubtitle}
                                template={template}
                                pageFormat={pageFormat}
                                onPagesRendered={setPageCount}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                <p className="text-sm">
                                    {format !== "pdf"
                                        ? `Export ${format.toUpperCase()} bientôt disponible`
                                        : "Aucun contenu à afficher"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
