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
import { ChoiceCard } from "@/components/ui/choice-card";
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
    { id: "system", label: "Systeme" },
];

// === MODAL ===

export default function EditorSettingsModal({ open, onOpenChange }) {
    const [font, setFont] = useState("inter");
    const [size, setSize] = useState("md");
    const [theme, setTheme] = useState("system");

    const handleSave = () => {
        // TODO: Sauvegarder les preferences editeur
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Paramètres de l'éditeur</DialogTitle>
                    <DialogDescription>
                        Personnalisez l'apparence de l'éditeur
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
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
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave}>
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
