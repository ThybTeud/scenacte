import { Button } from "@/components/ui/button";
import { PanelLeftClose } from "lucide-react";

export function EditorStructurePanel({
  structure,
  characters,
  activeActeIndex,
  activeSceneIndex,
  onSectionClick,
  onCharacterClick,
  onClose,
}) {
  return (
    <div className="hidden md:flex md:flex-col w-48 shrink-0 h-full overflow-hidden border-2 border-gray-900 rounded-lg shadow-brutal">
      <div className="px-6 h-16 bg-gray-200 border-b-2 border-gray-900 flex items-center justify-between">
        <div className="font-bold uppercase">Structure</div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <PanelLeftClose className="fill-white" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-white">
        <div className="mb-4">
          <div className="font-semibold uppercase text-sm mb-2">Sommaire</div>
          <div className="space-y-2 text-xs">
            {structure?.items?.map((acte, acteIndex) => (
              <div key={acteIndex} className="space-y-1">
                <button
                  className={`w-full text-left px-2 py-1 rounded hover:bg-pink-100 clamp-1 ${
                    activeActeIndex === acteIndex
                      ? activeSceneIndex === -1
                        ? "bg-rose-400 text-white font-semibold"
                        : "bg-rose-200 font-semibold"
                      : ""
                  }`}
                  onClick={() => onSectionClick(acte.position)}
                >
                  {acte.value || `Acte ${acteIndex + 1}`}
                </button>
                <div className="ml-2 space-y-1">
                  {acte.scenes?.map((scene, sceneIndex) => (
                    <button
                      key={sceneIndex}
                      className={`w-full text-left pl-2 pr-2 py-1 rounded hover:bg-pink-100 hover:text-gray-900 ${
                        activeActeIndex === acteIndex && activeSceneIndex === sceneIndex
                          ? "bg-rose-400 text-white font-semibold"
                          : ""
                      }`}
                      onClick={() => onSectionClick(scene.position)}
                    >
                      {scene.value || `Scène ${sceneIndex + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-semibold uppercase text-sm mb-2">Personnages</div>
          <div className="space-y-1">
            {characters.map((character, index) => (
              <button
                key={character || index}
                className="w-full text-left px-2 py-1 font-editor font-semibold text-sm text-blue-600 hover:bg-blue-50 rounded"
                onClick={() => onCharacterClick(character)}
              >
                @{character}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
