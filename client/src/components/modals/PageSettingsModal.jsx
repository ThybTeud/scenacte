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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FORMATS = [
    { id: "a4", label: "A4", dimensions: "210 × 297 mm" },
    { id: "a5", label: "A5", dimensions: "148 × 210 mm" },
    { id: "letter", label: "Letter", dimensions: "216 × 279 mm" },
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
                "flex flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                selected && "border-primary bg-primary/5 ring-1 ring-primary",
                className
            )}
        >
            {children}
        </button>
    );
}

export default function PageSettingsModal({ open, onOpenChange }) {
    const [format, setFormat] = useState("a4");
    const [template, setTemplate] = useState("standard");
    const [margins, setMargins] = useState({
        top: 20,
        bottom: 25,
        left: 15,
        right: 15,
    });

    const handleMarginChange = (side, value) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0) {
            setMargins((prev) => ({ ...prev, [side]: num }));
        }
    };

    const handleSave = () => {
        // TODO: Sauvegarder dans localStorage ou contexte
        console.log("Page settings:", { format, template, margins });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mise en page</DialogTitle>
                    <DialogDescription>
                        Configurez le format d'impression
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Format papier */}
                    <div className="space-y-3">
                        <Label>Format</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {FORMATS.map((f) => (
                                <ChoiceCard
                                    key={f.id}
                                    selected={format === f.id}
                                    onClick={() => setFormat(f.id)}
                                >
                                    <span className="font-medium">
                                        {f.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {f.dimensions}
                                    </span>
                                </ChoiceCard>
                            ))}
                        </div>
                    </div>

                    {/* Template */}
                    <div className="space-y-3">
                        <Label>Template</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {TEMPLATES.map((t) => (
                                <ChoiceCard
                                    key={t.id}
                                    selected={template === t.id}
                                    onClick={() => setTemplate(t.id)}
                                    className="flex-row items-center justify-between px-4"
                                >
                                    <div className="text-left">
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

                    {/* Marges */}
                    <div className="space-y-3">
                        <Label>Marges (mm)</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Haut
                                </span>
                                <Input
                                    type="number"
                                    min="0"
                                    value={margins.top}
                                    onChange={(e) =>
                                        handleMarginChange(
                                            "top",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Bas
                                </span>
                                <Input
                                    type="number"
                                    min="0"
                                    value={margins.bottom}
                                    onChange={(e) =>
                                        handleMarginChange(
                                            "bottom",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Gauche
                                </span>
                                <Input
                                    type="number"
                                    min="0"
                                    value={margins.left}
                                    onChange={(e) =>
                                        handleMarginChange(
                                            "left",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">
                                    Droite
                                </span>
                                <Input
                                    type="number"
                                    min="0"
                                    value={margins.right}
                                    onChange={(e) =>
                                        handleMarginChange(
                                            "right",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Annuler
                    </Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
