import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { DEFAULT_PRESETS } from "@/config/template-presets";

// === DATA ===

const FORMATS = [
    { id: "A5", label: "A5", dimensions: "148 x 210 mm" },
    { id: "A4", label: "A4", dimensions: "210 x 297 mm" },
];

const PRESETS = Object.entries(DEFAULT_PRESETS).map(([id, preset]) => ({
    id,
    ...preset,
}));

// === CHOICE CARD ===

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

// === MODAL ===

export default function PageSettingsModal({
    open,
    onOpenChange,
    currentPaperSize = "A5",
    currentPresetId = null,
    onSettingsChange,
}) {
    const [paperSize, setPaperSize] = useState(currentPaperSize);
    const [selectedPresetId, setSelectedPresetId] = useState(currentPresetId);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setPaperSize(currentPaperSize);
            setSelectedPresetId(currentPresetId);
        }
    }, [open, currentPaperSize, currentPresetId]);

    const handlePresetChange = (presetId) => {
        setSelectedPresetId(presetId);
        const preset = DEFAULT_PRESETS[presetId];
        if (preset?.pageFormat) {
            setPaperSize(preset.pageFormat);
        }
    };

    const handleSave = async () => {
        if (onSettingsChange) {
            setIsSaving(true);
            try {
                await onSettingsChange({
                    paperSize,
                    templateId: null,
                    template: null,
                    presetId: selectedPresetId,
                });
                onOpenChange(false);
            } catch (error) {
                console.error("Erreur sauvegarde settings:", error);
            } finally {
                setIsSaving(false);
            }
        } else {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Mise en page</DialogTitle>
                    <DialogDescription>
                        Configurez le format et le style d'export
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Format papier (désactivé car défini par le preset) */}
                    <div className="space-y-3 opacity-60">
                        <Label>Format</Label>
                        <div className="rounded-lg border p-3 bg-muted/30 text-center">
                            <span className="font-medium">A5</span>
                            <span className="text-xs text-muted-foreground block">
                                Défini par le preset
                            </span>
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="space-y-3">
                        <Label>Style</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {PRESETS.map((preset) => (
                                <ChoiceCard
                                    key={preset.id}
                                    selected={selectedPresetId === preset.id}
                                    onClick={() => handlePresetChange(preset.id)}
                                >
                                    <span className="font-medium">{preset.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {preset.description}
                                    </span>
                                </ChoiceCard>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            "Enregistrer"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
