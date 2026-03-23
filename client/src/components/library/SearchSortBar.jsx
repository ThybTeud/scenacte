import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_LABELS = {
    updated_at: "Modifié",
    created_at: "Créé",
    title: "Titre",
};

const SORT_OPTIONS = [
    { value: "updated_at", label: "Dernière modification" },
    { value: "created_at", label: "Date de création" },
    { value: "title", label: "Titre" },
];

export function SearchSortBar({ searchTerm, onSearchChange, sortBy, sortOrder, onSortChange }) {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const OrderIcon = sortOrder === "asc" ? ArrowUp : ArrowDown;

    return (
        <div
            className={cn(
                "flex items-center border-2 border-input rounded-sm bg-white overflow-hidden shadow-brutal",
                "transition-[color,box-shadow]",
                "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/25",
                "w-full sm:max-w-sm"
            )}
        >
            <Search className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
            <input
                type="search"
                placeholder="Rechercher une pièce..."
                className={cn(
                    "flex-1 h-9 bg-transparent px-3 py-1 min-w-0",
                    "text-base md:text-sm",
                    "placeholder:text-muted-foreground",
                    "selection:bg-primary selection:text-primary-foreground",
                    "outline-none border-none"
                )}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <div className="self-stretch w-px border-l-2 border-input shrink-0" />

            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <button
                        aria-label="Options de tri"
                        className={cn(
                            "flex items-center gap-1.5 h-9 px-3 text-sm whitespace-nowrap shrink-0",
                            "transition-colors cursor-pointer",
                            "hover:bg-surface-hover",
                            popoverOpen ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        )}
                    >
                        <OrderIcon className="h-3.5 w-3.5" />
                        <span>{SORT_LABELS[sortBy]}</span>
                    </button>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-64 p-3">
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Trier par</p>
                            <RadioGroup
                                value={sortBy}
                                onValueChange={(value) => onSortChange({ sortBy: value })}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <div key={option.value} className="flex items-center gap-2">
                                        <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
                                        <Label htmlFor={`sort-${option.value}`} className="cursor-pointer font-normal">
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Ordre</p>
                            <div className="flex gap-1">
                                <Button
                                    variant={sortOrder === "desc" ? "default" : "ghost"}
                                    size="sm"
                                    className="flex-1 gap-1.5"
                                    onClick={() => onSortChange({ sortOrder: "desc" })}
                                >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                    Décroissant
                                </Button>
                                <Button
                                    variant={sortOrder === "asc" ? "default" : "ghost"}
                                    size="sm"
                                    className="flex-1 gap-1.5"
                                    onClick={() => onSortChange({ sortOrder: "asc" })}
                                >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                    Croissant
                                </Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
