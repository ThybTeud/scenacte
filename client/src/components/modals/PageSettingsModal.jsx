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
import { storageService } from "@/services/storage.service";
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

function ChoiceCard({ selected, onClick, children, className, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                selected && "border-primary bg-primary/5 ring-1 ring-primary",
                disabled && "opacity-50 cursor-not-allowed",
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
    playId,
    currentPaperSize = "A5",
    currentTemplateId = null,
    currentTemplate = null,
    currentPresetId = null,
    onSettingsChange,
}) {
    const [paperSize, setPaperSize] = useState(currentPaperSize);
    const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId);
    const [selectedPresetId, setSelectedPresetId] = useState(currentPresetId);

    const [templates, setTemplates] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            loadTemplates();
            setPaperSize(currentPaperSize);
            setSelectedTemplateId(currentTemplateId);
            setSelectedPresetId(currentPresetId);
        }
    }, [open, currentPaperSize, currentTemplateId, currentPresetId]);

    // Quand un preset est sélectionné, mettre à jour le format papier automatiquement
    const handlePresetChange = (presetId) => {
        setSelectedPresetId(presetId);
        setSelectedTemplateId(null); // Désélectionner le template si un preset est choisi
        const preset = DEFAULT_PRESETS[presetId];
        if (preset?.pageFormat) {
            setPaperSize(preset.pageFormat);
        }
    };

    // Quand un template est sélectionné, désélectionner le preset
    const handleTemplateChange = (templateId) => {
        setSelectedTemplateId(templateId);
        setSelectedPresetId(null); // Désélectionner le preset si un template est choisi
    };

    const loadTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const response = await storageService.getPublicTemplates();
            setTemplates(response.templates || []);

            if (!currentTemplateId && response.templates?.length > 0) {
                const defaultTemplate = response.templates.find(t => t.isDefault);
                if (defaultTemplate) {
                    setSelectedTemplateId(defaultTemplate.id);
                }
            }
        } catch (error) {
            console.error("Erreur chargement templates:", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSave = async () => {
        const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

        if (onSettingsChange) {
            setIsSaving(true);
            try {
                await onSettingsChange({
                    paperSize,
                    templateId: selectedTemplateId,
                    template: selectedTemplate || null,
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

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || currentTemplate;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Mise en page</DialogTitle>
                    <DialogDescription>
                        Configurez le format et le template d'export
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Format papier */}
                    <div className="space-y-3">
                        <Label>Format</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {FORMATS.map((f) => (
                                <ChoiceCard
                                    key={f.id}
                                    selected={paperSize === f.id}
                                    onClick={() => setPaperSize(f.id)}
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

                    {/* Presets (nouveau système) */}
                    <div className="space-y-3">
                        <Label>Presets éditeurs</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {PRESETS.map((preset) => (
                                <ChoiceCard
                                    key={preset.id}
                                    selected={selectedPresetId === preset.id}
                                    onClick={() => handlePresetChange(preset.id)}
                                    className="flex-row items-center justify-between px-4"
                                >
                                    <div className="text-left">
                                        <span className="font-medium">
                                            {preset.name}
                                        </span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {preset.description}
                                        </span>
                                    </div>
                                    {selectedPresetId === preset.id && (
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    )}
                                </ChoiceCard>
                            ))}
                        </div>
                    </div>

                    {/* Template (ancien système) */}
                    <div className="space-y-3">
                        <Label>Template</Label>
                        {isLoadingTemplates ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">
                                    Chargement...
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {templates.map((t) => (
                                    <ChoiceCard
                                        key={t.id}
                                        selected={selectedTemplateId === t.id}
                                        onClick={() => handleTemplateChange(t.id)}
                                        className="flex-row items-center justify-between px-4"
                                    >
                                        <div className="text-left">
                                            <span className="font-medium">
                                                {t.name}
                                            </span>
                                            {t.settings?.fontFamily && (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {t.settings.fontFamily}
                                                </span>
                                            )}
                                        </div>
                                        {selectedTemplateId === t.id && (
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </ChoiceCard>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Apercu des marges du template */}
                    {selectedTemplate?.settings?.margins && (
                        <div className="space-y-3">
                            <Label className="text-muted-foreground">
                                Marges du template (mm)
                            </Label>
                            <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Haut</span>
                                    <span>{selectedTemplate.settings.margins.top}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Bas</span>
                                    <span>{selectedTemplate.settings.margins.bottom}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Gauche</span>
                                    <span>{selectedTemplate.settings.margins.left}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Droite</span>
                                    <span>{selectedTemplate.settings.margins.right}</span>
                                </div>
                            </div>
                        </div>
                    )}
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
