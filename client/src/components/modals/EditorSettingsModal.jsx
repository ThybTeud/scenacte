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
import { cn } from "@/lib/utils";

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

export default function EditorSettingsModal({ open, onOpenChange }) {
    const [font, setFont] = useState("inter");
    const [size, setSize] = useState("md");
    const [theme, setTheme] = useState("system");

    const handleSave = () => {
        // TODO: Sauvegarder dans localStorage ou contexte
        console.log("Editor settings:", { font, size, theme });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Paramètres de l'éditeur</DialogTitle>
                    <DialogDescription>
                        Personnalisez l'apparence de l'éditeur
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
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
                                    <span className="text-xs">{f.label}</span>
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
