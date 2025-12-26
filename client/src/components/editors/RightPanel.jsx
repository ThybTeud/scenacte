import { Card } from "../ui/Card";

export function RightPanel({
    structure = { actes: [], scenes: [] },
    statistics = null,
    onNavigateToSection,
}) {
    const handleSectionClick = (position) => {
        if (onNavigateToSection && position) {
            onNavigateToSection(position);
        }
    };

    // Organiser les scènes par acte
    const organizedStructure = structure.actes.map((acte, acteIndex) => {
        const actScenes = structure.scenes.filter((scene) => {
            // Si on a un système de hiérarchie dans la structure
            // Pour l'instant on va juste grouper séquentiellement
            const nextActePosition =
                structure.actes[acteIndex + 1]?.position?.start;
            const scenePosition = scene.position?.start;
            return (
                scenePosition > acte.position?.start &&
                (nextActePosition === undefined ||
                    scenePosition < nextActePosition)
            );
        });
        return { acte, scenes: actScenes };
    });

    // Gestion des scènes orphelines (sans acte parent)
    const orphanScenes = structure.scenes.filter((scene) => {
        return !structure.actes.some((acte, acteIndex) => {
            const nextActePosition =
                structure.actes[acteIndex + 1]?.position?.start;
            const scenePosition = scene.position?.start;
            return (
                scenePosition > acte.position?.start &&
                (nextActePosition === undefined ||
                    scenePosition < nextActePosition)
            );
        });
    });

    return (
        <div className="h-full flex flex-col w-60 px-6 py-8 bg-cyan-100/50 gap-y-8">
            {/* Sommaire */}
            <Card header="Sommaire" size="sm" heightMax="flex-1">
                {structure.actes.length === 0 &&
                structure.scenes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-3">
                        <p className="text-center text-xs text-gray-500 italic font-ui">
                            Ecrivez des actes, des scènes ou des tableaux avec
                            '#'
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <nav className="space-y-2">
                            {/* Scènes orphelines en début */}
                            {orphanScenes.length > 0 &&
                                structure.actes.length > 0 && (
                                    <div className="mb-3">
                                        {orphanScenes.map((scene, index) => (
                                            <button
                                                key={`orphan-${index}`}
                                                onClick={() =>
                                                    handleSectionClick(
                                                        scene.position
                                                    )
                                                }
                                                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange rounded transition-colors font-ui"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span>{scene.value}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                            {/* Actes et leurs scènes */}
                            {organizedStructure.map((item, acteIndex) => (
                                <div key={acteIndex} className="space-y-1">
                                    <button
                                        onClick={() =>
                                            handleSectionClick(
                                                item.acte.position
                                            )
                                        }
                                        className="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-orange-400 hover:text-white rounded font-ui cursor-pointer"
                                    >
                                        <span className="flex items-center space-y-2">
                                            <span>{item.acte.value}</span>
                                        </span>
                                    </button>

                                    {/* Scènes de cet acte */}
                                    {item.scenes.length > 0 && (
                                        <ul className="ml-4">
                                            {item.scenes.map(
                                                (scene, sceneIndex) => (
                                                    <li
                                                        key={sceneIndex}
                                                        onClick={() =>
                                                            handleSectionClick(
                                                                scene.position
                                                            )
                                                        }
                                                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-orange-400 hover:text-white hover:font-bold rounded font-ui cursor-pointer"
                                                    >
                                                        <span className="flex items-center space-y-2">
                                                            <span>
                                                                {scene.value}
                                                            </span>
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    )}
                                </div>
                            ))}

                            {/* Si pas d'actes mais des scènes */}
                            {structure.actes.length === 0 &&
                                structure.scenes.length > 0 && (
                                    <div className="space-y-1">
                                        {structure.scenes.map(
                                            (scene, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        handleSectionClick(
                                                            scene.position
                                                        )
                                                    }
                                                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange rounded transition-colors font-ui"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span>
                                                            {scene.value}
                                                        </span>
                                                    </span>
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                        </nav>
                    </div>
                )}
            </Card>

            {/* Statistiques (sticky en bas) */}
            <div
                className="p-4 bg-white"
                style={{ borderTop: "1px solid #e5e5e5" }}
            >
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 font-ui">
                    Statistiques
                </h3>

                {!statistics ? (
                    <p className="text-sm text-gray-500 italic font-ui">
                        Chargement...
                    </p>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-cream rounded">
                            <span className="text-sm text-gray-600 font-ui">
                                Scènes
                            </span>
                            <span className="text-lg font-semibold text-gray-900 font-ui">
                                {statistics.totalScenes || 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-cream rounded">
                            <span className="text-sm text-gray-600 font-ui">
                                Répliques
                            </span>
                            <span className="text-lg font-semibold text-gray-900 font-ui">
                                {statistics.totalLines || 0}
                            </span>
                        </div>

                        {/* Stats supplémentaires (optionnelles, affichées en petit) */}
                        {/* Masquée pour le moment */}
                        {/* {statistics.totalActs > 0 && (
              <div className="pt-2 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Actes</span>
                  <span>{statistics.totalActs}</span>
                </div>
                {statistics.totalCharacters > 0 && (
                  <div className="flex justify-between">
                    <span>Personnages</span>
                    <span>{statistics.totalCharacters}</span>
                  </div>
                )}
                {statistics.wordCount > 0 && (
                  <div className="flex justify-between">
                    <span>Mots</span>
                    <span>{statistics.wordCount.toLocaleString()}</span>
                  </div>
                )}
                
              </div>
            )} */}
                    </div>
                )}
            </div>
        </div>
    );
}
