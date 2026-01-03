import { Button, ButtonGroup } from "../ui/Button";
import { EditorButton } from "../ui/EditorButton";
import { Card } from "../ui/Card";

export function LeftPanel({
    onUndo,
    onRedo,
    onSave,
    onExportPdf,
    onTogglePreview,
    onToggleFormat,
    onInsertCharacter,
    characters = [],
    canUndo = false,
    canRedo = false,
    showPreview = true,
    isSaving = false,
}) {
    const formatButtons = [
        {
            id: "acte",
            label: "#Acte",
            shortcut: "Ctrl+1",
            background: "bg-orange",
            textColor: "text-white",
            fontWeight: "font-bold",
        },
        {
            id: "scene",
            label: "##Scène",
            shortcut: "Ctrl+1",
            background: "bg-orange",
            textColor: "text-white",
            fontWeight: "font-bold",
        },
        {
            id: "personnage",
            label: "@Personnage",
            shortcut: "Ctrl+2",
            background: "bg-blue",
            textColor: "text-white",
            fontWeight: "font-bold",
        },
        {
            id: "didascalie",
            label: "(Didascalie)",
            shortcut: "Ctrl+3",
            background: "bg-gray",
            textColor: "text-white",
            font: "italic",
        },
        {
            id: "dialogue",
            label: "Dialogue",
            shortcut: "Ctrl+4",
            background: "bg-white",
            textColor: "text-black",
        },
    ];

    return (
        <div className="h-full flex flex-col w-60 px-6 py-8 gap-y-8">
            {/* Toolbar Section */}
            <div className="flex items-center justify-between">
                {/* Groupe 1: Historique */}
                <ButtonGroup className="flex">
                    <Button
                        variant="secondary"
                        square={true}
                        onClick={onUndo}
                        disabled={!canUndo}
                        title="Annuler (Ctrl+Z)"
                        className="flex-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                            />
                        </svg>
                    </Button>
                    <Button
                        variant="secondary"
                        square={true}
                        onClick={onRedo}
                        disabled={!canRedo}
                        title="Rétablir (Ctrl+Y)"
                        className="flex-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                            />
                        </svg>
                    </Button>
                </ButtonGroup>

                {/* Groupe 2: Fichier & Aperçu */}
                <ButtonGroup>
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onSave}
                        disabled={isSaving}
                        square={true}
                        title="Sauvegarder"
                        className="flex-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                        {isSaving ? "..." : ""}
                    </Button>

                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onExportPdf}
                        square={true}
                        title="Télécharger"
                        className="flex-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                        </svg>
                    </Button>

                    <Button
                        variant="secondary"
                        square={true}
                        size="md"
                        onClick={onTogglePreview}
                        title="Afficher l'aperçu"
                        className="flex-1"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {showPreview ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            )}
                        </svg>
                    </Button>
                </ButtonGroup>
            </div>

            {/* Raccourcis de mise en page */}
            <div className="flex-shrink-0">
                <div className="flex flex-col gap-y-4">
                    {formatButtons.map((format) => (
                        <EditorButton
                            key={format.id}
                            label={format.label}
                            shortcut={format.shortcut}
                            background={format.background}
                            textColor={format.textColor}
                            font={format.font}
                            fontWeight={format.fontWeight}
                            onClick={() => onToggleFormat(format.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Liste des personnages */}
            <Card header="Personnages" size="sm" heightMax="flex-1">
                {characters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-3">
                        <p className="text-center text-xs text-gray-500 italic font-ui">
                            Ecrivez le nom d'un personnage avec '@'
                        </p>
                    </div>
                ) : (
                    <ul className="">
                        {characters.map((character, index) => (
                            <li
                                key={index}
                                onClick={() => onInsertCharacter(character)}
                                className="px-2 py-1 text-base hover:bg-blue-400 text-blue hover: hover:text-white active:bg-blue cursor-pointer rounded"
                                title={`Insérer @${character}`}
                            >
                                <span className="font-mono font-bold line-clamp-1 break-all">
                                    @{character}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}
