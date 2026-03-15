import { Button } from "@/components/ui/button";
import { PanelRightClose } from "lucide-react";
import ShadowPreview from "@/components/editors/ShadowPreview";
import { shadowPreviewCSS, adaptForShadow } from "@/utils/shadowPreview";
import { generatePresetCSS } from "@/config/template-presets";

export function EditorPreviewPanel({ preset, htmlContent, onClose }) {
  return (
    <div className="hidden md:flex md:flex-col flex-1 min-w-0 max-w-lg h-full overflow-hidden border-2 border-border rounded-sm shadow-brutal">
      <div className="px-6 h-16 shrink-0 bg-surface-muted border-b-2 border-border flex items-center justify-between">
        <div className="font-bold uppercase font-heading">Aperçu</div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <PanelRightClose className="fill-white" />
        </Button>
      </div>
      <div className="overflow-auto flex-1 bg-white">
        <div className="grid grid-cols-[1rem_1fr_1rem] grid-rows-[1rem_auto_1rem] min-h-full">
          <div className="border-b-2 border-r-2 border-dashed border-gray-300" />
          <div className="border-b-2 border-dashed border-gray-300" />
          <div className="border-b-2 border-l-2 border-dashed border-gray-300" />
          <div className="border-r-2 border-dashed border-gray-300" />
          <ShadowPreview
            css={`${shadowPreviewCSS}\n${adaptForShadow(generatePresetCSS(preset))}`}
            htmlContent={htmlContent}
            layout={preset.layout}
            className="w-full bg-white overflow-auto px-8 py-2"
          />
          <div className="border-l-2 border-dashed border-gray-300" />
          <div className="border-t-2 border-r-2 border-dashed border-gray-300" />
          <div className="border-t-2 border-dashed border-gray-300" />
          <div className="border-t-2 border-l-2 border-dashed border-gray-300" />
        </div>
      </div>
    </div>
  );
}
