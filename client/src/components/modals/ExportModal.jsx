import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, FileCode, File, Download, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { PdfPreview } from "@/components/pdf/PdfPreview";
import { printPdf } from "@/utils/pdfExport";

const FORMATS = [
    {
        id: "pdf",
        label: "PDF",
        description: "Prêt à imprimer",
        icon: FileText,
        disabled: false,
    },
    {
        id: "md",
        label: "Markdown",
        description: "Format source",
        icon: FileCode,
        disabled: true,
    },
    {
        id: "txt",
        label: "Texte brut",
        description: "Sans mise en forme",
        icon: File,
        disabled: true,
    },
];

const TEMPLATES = [
    {
        id: "classic",
        label: "Classique",
        description: "Style traditionnel",
    },
    {
        id: "modern",
        label: "Moderne",
        description: "Lignes épurées",
    },
    {
        id: "minimal",
        label: "Minimaliste",
        description: "Sobre et compact",
    },
];

function ChoiceCard({ selected, onClick, children, className, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors",
                !disabled && "hover:bg-accent hover:text-accent-foreground",
                selected && "border-primary bg-primary/5 ring-1 ring-primary",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {children}
        </button>
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
    const [template, setTemplate] = useState("classic");
    const [pageCount, setPageCount] = useState(0);
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);
    const iframeRef = useRef(null);

    const handleDownload = () => {
        printPdf(iframeRef);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Exporter la pièce</DialogTitle>
                    <DialogDescription>
                        Choisissez le format et le style d'export
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 py-4">
                    {/* Panneau gauche - Options */}
                    <div className="w-full md:w-[220px] lg:w-[250px] space-y-4 md:space-y-6 flex-shrink-0">
                        {/* Format */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                Format
                            </label>
                            <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-3">
                                {FORMATS.map((f) => (
                                    <ChoiceCard
                                        key={f.id}
                                        selected={format === f.id}
                                        onClick={() =>
                                            !f.disabled && setFormat(f.id)
                                        }
                                        disabled={f.disabled}
                                        className="p-2 md:p-4"
                                    >
                                        <f.icon size={20} className="mb-1 hidden md:block" />
                                        <span className="font-medium text-sm md:text-base">
                                            {f.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground hidden md:block">
                                            {f.description}
                                        </span>
                                    </ChoiceCard>
                                ))}
                            </div>
                        </div>

                        {/* Template PDF (visible uniquement si format PDF) */}
                        {format === "pdf" && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    Template
                                </label>
                                <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-3">
                                    {TEMPLATES.map((t) => (
                                        <ChoiceCard
                                            key={t.id}
                                            selected={template === t.id}
                                            onClick={() => setTemplate(t.id)}
                                            className="p-2 md:p-4"
                                        >
                                            <span className="font-medium text-sm md:text-base">
                                                {t.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground hidden md:block">
                                                {t.description}
                                            </span>
                                        </ChoiceCard>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nombre de pages */}
                        {format === "pdf" && pageCount > 0 && (
                            <div className="text-sm text-muted-foreground">
                                {pageCount} page{pageCount > 1 ? "s" : ""}
                            </div>
                        )}

                        {/* Bouton toggle preview sur mobile */}
                        {format === "pdf" && htmlContent && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full md:hidden"
                                onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                            >
                                {showPreviewMobile ? (
                                    <>
                                        <EyeOff size={16} className="mr-2" />
                                        Masquer l'aperçu
                                    </>
                                ) : (
                                    <>
                                        <Eye size={16} className="mr-2" />
                                        Voir l'aperçu
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Panneau droit - Preview (masqué sur mobile sauf si toggle) */}
                    <div className={cn(
                        "flex-1 min-h-[300px] md:min-h-[500px] lg:min-h-[600px]",
                        "hidden md:block",
                        showPreviewMobile && "!block"
                    )}>
                        {format === "pdf" && htmlContent && (
                            <PdfPreview
                                ref={iframeRef}
                                htmlContent={htmlContent}
                                playTitle={playTitle}
                                playSubtitle={playSubtitle}
                                template={template}
                                pageFormat="A4"
                                onPagesRendered={setPageCount}
                            />
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDownload}
                        className="w-full sm:w-auto"
                    >
                        <Download size={16} className="mr-2" />
                        Télécharger PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
