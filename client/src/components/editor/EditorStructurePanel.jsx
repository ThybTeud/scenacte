import { Button } from "@/components/ui/button";

export function EditorStructurePanel({
  structure,
  characters,
  activeActeIndex,
  activeSceneIndex,
  activeOrphanSceneIndex,
  isBeforeStructure,
  onSectionClick,
  onCharacterClick,
  onClose,
}) {
  return (
    <div className="hidden md:flex md:flex-col w-48 shrink-0 h-full overflow-hidden border-2 border-border rounded-sm shadow-brutal">
      <div className="px-6 h-16 bg-surface-muted border-b-2 border-border flex items-center justify-between">
        <div className="font-bold uppercase font-heading">Structure</div>
        <Button variant="ghost" size="icon" onClick={onClose}>
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-white">
        <div className="mb-4">
          <div className="font-semibold uppercase text-sm mb-2">Sommaire</div>
          <div className="space-y-2 text-xs">
            {isBeforeStructure && (
              <div className="h-0.5 bg-act rounded-full" />
            )}
            {structure?.orphanScenes?.map((scene, sceneIndex) => (
              <button
                key={`orphan-${sceneIndex}`}
                className={`w-full text-left pl-2 pr-2 py-1 rounded hover:bg-act-muted ${
                  activeOrphanSceneIndex === sceneIndex
                    ? "bg-act text-white font-semibold"
                    : ""
                }`}
                onClick={() => onSectionClick(scene.position)}
              >
                {scene.value || `Scène ${sceneIndex + 1}`}
              </button>
            ))}
            {structure?.items?.map((acte, acteIndex) => (
              <div key={acteIndex} className="space-y-1">
                <button
                  className={`w-full text-left px-2 py-1 rounded hover:bg-act-muted clamp-1 ${
                    activeActeIndex === acteIndex
                      ? activeSceneIndex === -1
                        ? "bg-act text-white font-semibold"
                        : "bg-act-light font-semibold"
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
                      className={`w-full text-left pl-2 pr-2 py-1 rounded hover:bg-act-muted ${
                        activeActeIndex === acteIndex && activeSceneIndex === sceneIndex
                          ? "bg-act text-white font-semibold"
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
                className="w-full text-left px-2 py-1 font-editor font-semibold text-sm text-character hover:bg-character-muted rounded"
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
