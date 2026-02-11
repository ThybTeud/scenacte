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
import { DEFAULT_PRESETS, DEFAULT_PRESET_ID, PRESET_ORDER } from "@/config/template-presets";
import { Loader2 } from "lucide-react";

// === CHOICE CARD ===

function ChoiceCard({ selected, onClick, children, className, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                selected && "border-primary bg-primary/5 ring-2 ring-primary",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {children}
        </button>
    );
}

// === MODAL ===

/**
 * Modal de sélection de preset PDF
 * @param {Object} props
 * @param {boolean} props.open - Modal ouvert ou fermé
 * @param {Function} props.onOpenChange - Callback pour changer l'état du modal
 * @param {string} [props.currentPresetId] - ID du preset actuel
 * @param {Function} props.onSettingsChange - Callback avec le nouveau presetId
 */
export default function PageSettingsModal({
    open,
    onOpenChange,
    currentPresetId = DEFAULT_PRESET_ID,
    onSettingsChange,
}) {
    const [selectedPresetId, setSelectedPresetId] = useState(currentPresetId);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setSelectedPresetId(currentPresetId || DEFAULT_PRESET_ID);
        }
    }, [open, currentPresetId]);

    const handleSave = async () => {
        if (onSettingsChange) {
            setIsSaving(true);
            try {
                await onSettingsChange({
                    presetId: selectedPresetId,
                });
                onOpenChange(false);
            } catch (error) {
                console.error("Erreur sauvegarde preset:", error);
            } finally {
                setIsSaving(false);
            }
        } else {
            onOpenChange(false);
        }
    };

    const selectedPreset = DEFAULT_PRESETS[selectedPresetId];

    // Extraire les infos du preset pour l'affichage
    const getPresetInfo = (presetId) => {
        const preset = DEFAULT_PRESETS[presetId];
        if (!preset) return null;

        // Extraire la police principale
        const fontFamily = preset.variables['--font-body']?.match(/'([^']+)'/)?.[1] || 'Crimson Text';

        // Extraire le format de page
        const pageWidth = preset.variables['--page-width'];
        const pageHeight = preset.variables['--page-height'];

        // Déterminer le format (approximatif)
        let format = 'Custom';
        if (pageWidth === '148mm' && pageHeight === '210mm') format = 'A5';
        else if (pageWidth === '210mm' && pageHeight === '297mm') format = 'A4';
        else if (pageWidth === '110mm' && pageHeight === '180mm') format = 'Poche';
        else if (pageWidth === '140mm' && pageHeight === '210mm') format = 'Intermédiaire';

        return {
            fontFamily,
            format,
            pageWidth,
            pageHeight,
        };
    };

    const selectedInfo = selectedPreset ? getPresetInfo(selectedPresetId) : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Mise en page</DialogTitle>
                    <DialogDescription>
                        Choisissez un preset d'export PDF
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Liste des presets */}
                    <div className="space-y-3">
                        <Label>Presets disponibles</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {PRESET_ORDER.map((presetId) => {
                                const preset = DEFAULT_PRESETS[presetId];
                                if (!preset) return null;

                                const info = getPresetInfo(presetId);

                                return (
                                    <ChoiceCard
                                        key={presetId}
                                        selected={selectedPresetId === presetId}
                                        onClick={() => setSelectedPresetId(presetId)}
                                    >
                                        <div className="flex items-start justify-between w-full">
                                            <div className="flex-1">
                                                <div className="font-medium text-base">
                                                    {preset.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {preset.description}
                                                </div>
                                                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span>📏 {info.format}</span>
                                                    <span>✍️ {info.fontFamily}</span>
                                                    <span>
                                                        📐 {preset.layout === 'centered' ? 'Centré' :
                                                           preset.layout === 'inline' ? 'En ligne' : 'Marginal'}
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedPresetId === presetId && (
                                                <div className="h-3 w-3 rounded-full bg-primary shrink-0 ml-2" />
                                            )}
                                        </div>
                                    </ChoiceCard>
                                );
                            })}
                        </div>
                    </div>

                    {/* Aperçu des détails du preset sélectionné */}
                    {selectedPreset && selectedInfo && (
                        <div className="space-y-3 border-t pt-4">
                            <Label className="text-muted-foreground">
                                Détails du preset
                            </Label>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Format</span>
                                    <span>{selectedInfo.pageWidth} × {selectedInfo.pageHeight}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Disposition</span>
                                    <span>
                                        {selectedPreset.layout === 'centered' ? 'Personnage centré' :
                                         selectedPreset.layout === 'inline' ? 'Personnage en ligne' :
                                         'Personnage en marge'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Police</span>
                                    <span>{selectedInfo.fontFamily}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Taille</span>
                                    <span>{selectedPreset.variables['--font-size-body']}</span>
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
