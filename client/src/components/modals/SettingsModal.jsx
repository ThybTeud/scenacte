import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { storageService } from "@/services/storage.service";
import { Loader2 } from "lucide-react";

// === DATA ===

const FONTS = [
    { id: "inter", label: "Inter", style: "font-sans" },
    { id: "crimson", label: "Crimson Text", style: "font-serif" },
    { id: "fira", label: "Fira Code", style: "font-mono" },
];

const SIZES = [
    { id: "sm", label: "Petit", value: "14px" },
    { id: "md", label: "Moyen", value: "16px" },
    { id: "lg", label: "Grand", value: "18px" },
];

const THEMES = [
    { id: "light", label: "Clair" },
    { id: "dark", label: "Sombre" },
    { id: "system", label: "Systeme" },
];

const FORMATS = [
    { id: "A5", label: "A5", dimensions: "148 x 210 mm" },
    { id: "A4", label: "A4", dimensions: "210 x 297 mm" },
];

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

export default function SettingsModal({
    open,
    onOpenChange,
    defaultTab = "editor",
    // Props pour les settings de mise en page
    playId,
    currentPaperSize = "A5",
    currentTemplateId = null,
    currentTemplate = null,
    onSettingsChange,
}) {
    // Editor settings
    const [font, setFont] = useState("inter");
    const [size, setSize] = useState("md");
    const [theme, setTheme] = useState("system");

    // Page settings
    const [paperSize, setPaperSize] = useState(currentPaperSize);
    const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId);

    // Templates chargés depuis l'API
    const [templates, setTemplates] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Charger les templates au mount
    useEffect(() => {
        if (open) {
            loadTemplates();
            // Synchroniser avec les props
            setPaperSize(currentPaperSize);
            setSelectedTemplateId(currentTemplateId);
        }
    }, [open, currentPaperSize, currentTemplateId]);

    const loadTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const response = await storageService.getPublicTemplates();
            setTemplates(response.templates || []);

            // Si pas de template selectionne, prendre le defaut
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

        // Notifier le parent des changements
        if (onSettingsChange) {
            setIsSaving(true);
            try {
                await onSettingsChange({
                    paperSize,
                    templateId: selectedTemplateId,
                    template: selectedTemplate || null,
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

    // Trouver le template selectionne pour afficher ses details
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || currentTemplate;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Parametres</DialogTitle>
                    <DialogDescription>
                        Personnalisez l'editeur et la mise en page
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="editor">Editeur</TabsTrigger>
                        <TabsTrigger value="page">Mise en page</TabsTrigger>
                    </TabsList>

                    {/* === TAB EDITEUR === */}
                    <TabsContent value="editor" className="space-y-6 pt-4">
                        {/* Police */}
                        <div className="space-y-3">
                            <Label>Police</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {FONTS.map((f) => (
                                    <ChoiceCard
                                        key={f.id}
                                        selected={font === f.id}
                                        onClick={() => setFont(f.id)}
                                    >
                                        <span className={cn("text-lg", f.style)}>
                                            Aa
                                        </span>
                                        <span className="text-xs">
                                            {f.label}
                                        </span>
                                    </ChoiceCard>
                                ))}
                            </div>
                        </div>

                        {/* Taille */}
                        <div className="space-y-3">
                            <Label>Taille du texte</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {SIZES.map((s) => (
                                    <ChoiceCard
                                        key={s.id}
                                        selected={size === s.id}
                                        onClick={() => setSize(s.id)}
                                    >
                                        <span className="font-medium">
                                            {s.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {s.value}
                                        </span>
                                    </ChoiceCard>
                                ))}
                            </div>
                        </div>

                        {/* Theme */}
                        <div className="space-y-3">
                            <Label>Theme</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {THEMES.map((t) => (
                                    <ChoiceCard
                                        key={t.id}
                                        selected={theme === t.id}
                                        onClick={() => setTheme(t.id)}
                                    >
                                        <span className="font-medium">
                                            {t.label}
                                        </span>
                                    </ChoiceCard>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* === TAB MISE EN PAGE === */}
                    <TabsContent value="page" className="space-y-6 pt-4">
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

                        {/* Template */}
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
                                            onClick={() => setSelectedTemplateId(t.id)}
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
                    </TabsContent>
                </Tabs>

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
