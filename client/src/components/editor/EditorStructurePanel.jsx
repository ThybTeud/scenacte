import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function EditorStructurePanel({
  structure,
  characters,
  activeActeIndex,
  activeSceneIndex,
  activeOrphanSceneIndex,
  isBeforeStructure,
  onSectionClick,
  onCharacterClick,
}) {
  return (
    <div className="hidden md:flex md:flex-col w-48 shrink-0 h-full overflow-hidden border-2 border-border rounded-sm shadow-brutal">
      <div className="px-6 h-16 bg-surface-muted border-b-2 border-border flex items-center justify-between">
        <div className="font-bold uppercase font-heading">Structure</div>
      </div>
      <div className="flex flex-col flex-1 min-h-0 p-4 bg-white">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-gray font-semibold font-heading mb-1.5">Sommaire</div>
          <div className="space-y-1 text-xs">
            {isBeforeStructure && (
              <div className="border-l-[3px] border-l-act h-2" />
            )}
            {structure?.orphanScenes?.map((scene, sceneIndex) => (
              <button
                key={`orphan-${sceneIndex}`}
                className={`w-full text-left pl-2 pr-2 py-1 rounded-r-sm hover:bg-act-muted transition-colors ${
                  activeOrphanSceneIndex === sceneIndex
                    ? "border-l-[3px] border-l-act font-semibold"
                    : "border-l-[3px] border-l-transparent"
                }`}
                onClick={() => onSectionClick(scene.position)}
              >
                {scene.value || `Scène ${sceneIndex + 1}`}
              </button>
            ))}
            {structure?.items?.map((acte, acteIndex) => (
              <div key={acteIndex} className="space-y-0.5">
                <button
                  className={`w-full text-left px-2 py-1 rounded-r-sm hover:bg-act-muted line-clamp-1 transition-colors ${
                    activeActeIndex === acteIndex
                      ? activeSceneIndex === -1
                        ? "border-l-[3px] border-l-act font-semibold"
                        : "border-l-[3px] border-l-act-light font-medium"
                      : "border-l-[3px] border-l-transparent"
                  }`}
                  onClick={() => onSectionClick(acte.position)}
                >
                  {acte.value || `Acte ${acteIndex + 1}`}
                </button>
                <div className="ml-4">
                  {acte.scenes?.map((scene, sceneIndex) => (
                    <button
                      key={sceneIndex}
                      className={`w-full text-left pl-2 pr-2 py-1 rounded-r-sm hover:bg-act-muted transition-colors ${
                        activeActeIndex === acteIndex && activeSceneIndex === sceneIndex
                          ? "border-l-[3px] border-l-act font-semibold"
                          : "border-l-[3px] border-l-act-muted"
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

        <Separator className="my-3 bg-surface-base" />

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="text-[11px] uppercase tracking-wider text-gray font-semibold font-heading mb-1.5">Personnages</div>
          <ScrollArea className="flex-1">
            <div className="space-y-0.5">
              {characters.map((character, index) => (
                <button
                  key={character || index}
                  className="w-full text-left px-2 py-1 font-editor text-sm hover:bg-character-muted rounded-sm transition-colors truncate"
                  onClick={() => onCharacterClick(character)}
                >
                  <span className="text-character font-bold">@</span>
                  <span className="font-medium">{character}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
