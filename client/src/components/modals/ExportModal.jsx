import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, FileCode, File, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { PdfPreview } from "@/components/pdf/PdfPreview";
import { printPdf } from "@/utils/pdfExport";

const FORMATS = [
    { id: "pdf", label: "PDF", icon: FileText, disabled: false },
    { id: "md", label: "Markdown", icon: FileCode, disabled: true },
    { id: "txt", label: "Texte", icon: File, disabled: true },
];

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

export default function ExportModal({
    open,
    onOpenChange,
    htmlContent,
    playTitle,
    playSubtitle,
}) {
    const [format, setFormat] = useState("pdf");
    const [pageCount, setPageCount] = useState(0);
    const iframeRef = useRef(null);

    const handleDownload = () => {
        printPdf(iframeRef);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Exporter la pièce</DialogTitle>
                        {pageCount > 0 && (
                            <span className="text-sm text-muted-foreground">
                                {pageCount} page{pageCount > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* Colonne gauche */}
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

                        <div className="p-4 space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => onOpenChange(false)}
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
                    <div className="flex-1 min-h-0 overflow-hidden bg-muted/20">
                        {format === "pdf" && htmlContent ? (
                            <PdfPreview
                                ref={iframeRef}
                                htmlContent={htmlContent}
                                playTitle={playTitle}
                                playSubtitle={playSubtitle}
                                template="classic"
                                pageFormat="A4"
                                onPagesRendered={setPageCount}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
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
