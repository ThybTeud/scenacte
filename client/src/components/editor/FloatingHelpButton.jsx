import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BugReportModal } from "@/components/modals";
import { Bug } from "lucide-react";

const SYNTAX_ITEMS = [
  {
    marker: "#",
    label: "Acte",
    formatType: "heading1",
    colorClass: "text-[oklch(58.6%_0.253_17.585)]",
    fontClass: "font-semibold",
  },
  {
    marker: "##",
    label: "Scène",
    formatType: "heading2",
    colorClass: "text-[oklch(58.6%_0.253_17.585)]",
    fontClass: "font-semibold",
  },
  {
    marker: "@",
    label: "Personnage",
    formatType: "personnage",
    colorClass: "text-blue",
    fontClass: "font-semibold",
  },
  {
    marker: "( )",
    label: "Didascalie",
    formatType: "didascalie",
    colorClass: "text-gray",
    fontClass: "italic",
  },
];

export function FloatingHelpButton({ onToggleFormat, showBugReport = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 left-6 z-50 hidden md:block">
        <div className="relative">
          {/* Panneau syntaxe (au-dessus) */}
          <div
            className={`absolute bottom-full left-0 mb-2 bg-white border-2 border-border rounded-sm shadow-brutal p-4 transition-all duration-200 ease-out origin-bottom-left ${
              isOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-1 pointer-events-none"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide mb-2 font-heading">
              Syntaxe
            </p>
            <div className="space-y-1">
              {SYNTAX_ITEMS.map((item) => (
                <button
                  key={item.marker}
                  type="button"
                  onClick={() => onToggleFormat(item.formatType)}
                  className="flex items-center gap-2 w-full rounded-sm px-1.5 py-1 transition-colors hover:bg-surface-hover active:bg-surface-active"
                >
                  <code
                    className={`font-editor text-sm min-w-8 text-right ${item.colorClass} ${item.fontClass}`}
                  >
                    {item.marker}
                  </code>
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bouton bug (à droite) */}
          {showBugReport && (
            <div
              className={`absolute bottom-0 left-full ml-2 transition-all duration-200 ease-out origin-bottom-left ${
                isOpen
                  ? "opacity-100 scale-100 translate-x-0"
                  : "opacity-0 scale-95 -translate-x-1 pointer-events-none"
              }`}
            >
              <Button
                variant="secondary"
                size="sm"
                depth="raised"
                onClick={() => setShowBugReportModal(true)}
                className="whitespace-nowrap"
              >
                <Bug className="h-4 w-4" />
                Signaler un bug
              </Button>
            </div>
          )}

          {/* Bouton déclencheur */}
          <Button
            variant={isOpen ? "default" : "secondary"}
            size="icon"
            depth="raised"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label="Aide"
          >
            <span className="text-base font-bold">?</span>
          </Button>
        </div>
      </div>

      {showBugReport && (
        <BugReportModal
          open={showBugReportModal}
          onOpenChange={setShowBugReportModal}
        />
      )}
    </>
  );
}
