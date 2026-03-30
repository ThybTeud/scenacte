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
import { ChoiceCard } from "@/components/ui/choice-card";
import { DEFAULT_PRESETS, PAPER_FORMATS } from "@/config/template-presets";

// === DATA ===

const FORMATS = Object.entries(PAPER_FORMATS).map(([id, f]) => ({
    id, label: f.label, dimensions: f.dimensions,
}));

const PRESETS = Object.entries(DEFAULT_PRESETS).map(([id, preset]) => ({
    id,
    ...preset,
}));

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

                <div className="space-y-6">
                    {/* Format papier */}
                    <div className="space-y-3">
                        <Label>Format</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {FORMATS.map((format) => (
                                <ChoiceCard
                                    key={format.id}
                                    selected={paperSize === format.id}
                                    onClick={() => setPaperSize(format.id)}
                                >
                                    <span className="font-medium">{format.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {format.dimensions}
                                    </span>
                                </ChoiceCard>
                            ))}
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
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
