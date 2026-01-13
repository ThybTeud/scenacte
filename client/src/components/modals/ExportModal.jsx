import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, FileCode, File } from "lucide-react";
import { cn } from "@/lib/utils";

const FORMATS = [
    { id: "pdf", label: "PDF", description: "Prêt à imprimer", icon: FileText },
    {
        id: "md",
        label: "Markdown",
        description: "Format source",
        icon: FileCode,
    },
    {
        id: "txt",
        label: "Texte brut",
        description: "Sans mise en forme",
        icon: File,
    },
];

const TEMPLATES = [
    {
        id: "standard",
        label: "Standard",
        description: "Mise en page classique",
    },
    {
        id: "actes-sud",
        label: "Actes Sud",
        description: "Style Actes Sud-Papiers",
    },
    { id: "arche", label: "L'Arche", description: "Style Éditions L'Arche" },
];

function ChoiceCard({ selected, onClick, children, className }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                selected && "border-primary bg-primary/5 ring-1 ring-primary",
                className
            )}
        >
            {children}
        </button>
    );
}

export default function ExportModal({ open, onOpenChange }) {
    const [format, setFormat] = useState("pdf");
    const [template, setTemplate] = useState("standard");
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        // TODO: Connecter à la logique d'export
        console.log("Export:", { format, template });
        setTimeout(() => {
            setIsExporting(false);
            onOpenChange(false);
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Exporter la pièce</DialogTitle>
                    <DialogDescription>
                        Choisissez le format et le style d'export
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Format */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Format</label>
                        <div className="grid grid-cols-3 gap-3">
                            {FORMATS.map((f) => (
                                <ChoiceCard
                                    key={f.id}
                                    selected={format === f.id}
                                    onClick={() => setFormat(f.id)}
                                >
                                    <f.icon size={20} className="mb-1" />
                                    <span className="font-medium">
                                        {f.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
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
                            <div className="grid grid-cols-1 gap-3">
                                {TEMPLATES.map((t) => (
                                    <ChoiceCard
                                        key={t.id}
                                        selected={template === t.id}
                                        onClick={() => setTemplate(t.id)}
                                        className="flex-row items-center justify-between"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {t.label}
                                            </span>
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                {t.description}
                                            </span>
                                        </div>
                                        {template === t.id && (
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </ChoiceCard>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Annuler
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting ? "Export..." : "Exporter"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
