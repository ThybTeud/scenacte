import { Button, ButtonGroup } from "../ui/Button";

export function LeftPanel({
    onUndo,
    onRedo,
    onSave,
    onDownload,
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
        { id: "acte", label: "#Acte", shortcut: "Ctrl+1" },
        { id: "scene", label: "##Scène", shortcut: "Ctrl+1" },
        { id: "personnage", label: "@Personnage", shortcut: "Ctrl+2" },
        { id: "didascalie", label: "(Didascalie)", shortcut: "Ctrl+3" },
        { id: "dialogue", label: "Dialogue", shortcut: "Ctrl+4" },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar Section */}
            <div className="p-4 space-y-3">
                {/* Groupe 1: Historique */}
                <ButtonGroup className="flex">
                    <Button
                        variant="secondary"
                        square={true}
                        onClick={onUndo}
                        // disabled={!canUndo}
                        title="Annuler (Ctrl+Z)"
                        className="flex-1"
                    >
                        <svg
                            className="w-4 h-4 mr-1"
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
                        // disabled={!canRedo}
                        title="Rétablir (Ctrl+Y)"
                        className="flex-1"
                    >
                        <svg
                            className="w-4 h-4 mr-1"
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
                <div className="space-y-2">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onSave}
                        disabled={isSaving}
                        className="w-full"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
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
                        {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onDownload}
                        className="w-full"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        Télécharger
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onExportPdf}
                        className="w-full"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
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
                        Export PDF
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onTogglePreview}
                        className="w-full"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
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
                        {showPreview ? "Masquer" : "Afficher"} aperçu
                    </Button>
                </div>
            </div>

            {/* Raccourcis de mise en page */}
            <div
                className="p-4 flex-shrink-0"
                style={{ borderBottom: "1px solid #e5e5e5" }}
            >
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 font-ui">
                    Raccourcis de mise en page
                </h3>
                <div className="space-y-1.5">
                    {formatButtons.map((format) => (
                        <button
                            key={format.id}
                            onClick={() => onToggleFormat(format.id)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-gray-700 bg-white rounded hover:bg-gray-50 transition-colors font-ui"
                            style={{ border: "1px solid #e5e5e5" }}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-base">{format.icon}</span>
                                <span className="font-medium">
                                    {format.label}
                                </span>
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                                {format.shortcut}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste des personnages */}
            <div className="p-4 flex-1 overflow-y-auto">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 font-ui">
                    Personnages
                </h3>
                {characters.length === 0 ? (
                    <p className="text-sm text-gray-500 italic font-ui">
                        Aucun personnage défini
                    </p>
                ) : (
                    <div className="space-y-1">
                        {characters.map((character, index) => (
                            <button
                                key={index}
                                onClick={() => onInsertCharacter(character)}
                                className="w-full px-3 py-2 text-sm text-left text-gray-700 bg-white rounded hover:bg-orange-50 hover:text-orange-700 transition-colors font-ui"
                                style={{ border: "1px solid #e5e5e5" }}
                                title={`Insérer @${character}`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-orange">@</span>
                                    <span className="font-medium">
                                        {character}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
