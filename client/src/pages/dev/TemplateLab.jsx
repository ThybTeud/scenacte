import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { generatePdfHtml } from "@/utils/pdfExport";
import { DEFAULT_PRESETS } from "@/config/template-presets";
import { LAB_CONTENT } from "./lab-content";
import { Printer } from "lucide-react";

const PRESETS = Object.entries(DEFAULT_PRESETS).map(([id, preset]) => ({
  id,
  ...preset,
}));

function PresetCard({ preset, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        selected && "border-primary bg-primary/5 ring-1 ring-primary"
      )}
    >
      <div className="font-medium">{preset.name}</div>
      <div className="text-xs text-muted-foreground">{preset.description}</div>
      {selected && (
        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

export default function TemplateLab() {
  const [selectedPresetId, setSelectedPresetId] = useState("arche");
  const iframeRef = useRef(null);

  // Injecter le HTML dans l'iframe à chaque changement de preset
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const fullHtml = generatePdfHtml({
      htmlContent: LAB_CONTENT,
      playTitle: "Pièce de test",
      playSubtitle: "Template Lab",
      presetId: selectedPresetId,
    });

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Référence stable pour le cleanup
    const contentWindow = iframe.contentWindow;

    const handlePagedReady = () => {
      console.log("PagedJS ready");
    };

    contentWindow?.addEventListener("pagedjs-ready", handlePagedReady);

    return () => {
      contentWindow?.removeEventListener("pagedjs-ready", handlePagedReady);
    };
  }, [selectedPresetId]);

  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/30 p-6 overflow-y-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Template Lab</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Test des presets PDF avec PagedJS
          </p>
        </div>

        <div className="space-y-3">
          <Label>Presets disponibles</Label>
          <div className="space-y-2">
            {PRESETS.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                selected={selectedPresetId === preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Button onClick={handlePrint} className="w-full gap-2">
            <Printer size={16} />
            Imprimer / Télécharger PDF
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Utilisez Ctrl+P ou Cmd+P pour voir l'aperçu d'impression
          </p>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 overflow-hidden bg-muted/20">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Template Lab Preview"
        />
      </div>
    </div>
  );
}
