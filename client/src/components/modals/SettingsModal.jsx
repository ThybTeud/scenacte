import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
    { id: "system", label: "Système" },
];

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

export default function SettingsModal({
    open,
    onOpenChange,
    defaultTab = "editor",
}) {
    // Editor settings
    const [font, setFont] = useState("inter");
    const [size, setSize] = useState("md");
    const [theme, setTheme] = useState("system");

    // Page settings
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
        console.log("Settings:", {
            font,
            size,
            theme,
            format,
            template,
            margins,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Paramètres</DialogTitle>
                    <DialogDescription>
                        Personnalisez l'éditeur et la mise en page
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="editor">Éditeur</TabsTrigger>
                        <TabsTrigger value="page">Mise en page</TabsTrigger>
                    </TabsList>

                    {/* === TAB ÉDITEUR === */}
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
                                        <span
                                            className={cn("text-lg", f.style)}
                                        >
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

                        {/* Thème */}
                        <div className="space-y-3">
                            <Label>Thème</Label>
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
                    </TabsContent>
                </Tabs>

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
