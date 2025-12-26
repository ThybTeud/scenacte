import { Card } from "../ui/Card";

/**
 * Helper pour trouver la section active basée sur la position du curseur
 */
function findActiveSection(structure, currentLine) {
    if (currentLine == null)
        return { acteIndex: null, sceneIndex: null, orphanIndex: null };

    let bestMatch = {
        acteIndex: null,
        sceneIndex: null,
        orphanIndex: null,
        position: -1,
    };

    // Chercher dans les actes/scènes
    for (let a = structure.items.length - 1; a >= 0; a--) {
        const acte = structure.items[a];
        if (
            acte.position.start <= currentLine &&
            acte.position.start > bestMatch.position
        ) {
            // Chercher la scène dans cet acte
            let foundScene = false;
            for (let s = acte.scenes.length - 1; s >= 0; s--) {
                if (
                    acte.scenes[s].position.start <= currentLine &&
                    acte.scenes[s].position.start > bestMatch.position
                ) {
                    bestMatch = {
                        acteIndex: a,
                        sceneIndex: s,
                        orphanIndex: null,
                        position: acte.scenes[s].position.start,
                    };
                    foundScene = true;
                    break;
                }
            }
            // Dans l'acte mais avant toute scène (ou pas de scène trouvée)
            if (!foundScene) {
                bestMatch = {
                    acteIndex: a,
                    sceneIndex: null,
                    orphanIndex: null,
                    position: acte.position.start,
                };
            }
        }
    }

    // Chercher dans les scènes orphelines
    for (let i = structure.orphanScenes.length - 1; i >= 0; i--) {
        if (
            structure.orphanScenes[i].position.start <= currentLine &&
            structure.orphanScenes[i].position.start > bestMatch.position
        ) {
            bestMatch = {
                acteIndex: null,
                sceneIndex: null,
                orphanIndex: i,
                position: structure.orphanScenes[i].position.start,
            };
        }
    }

    return {
        acteIndex: bestMatch.acteIndex,
        sceneIndex: bestMatch.sceneIndex,
        orphanIndex: bestMatch.orphanIndex,
    };
}

export function RightPanel({
    structure = { items: [], orphanScenes: [] },
    statistics,
    onNavigateToSection,
    currentLine,
}) {
    const handleClick = (position) => {
        onNavigateToSection?.(position);
    };

    const isEmpty = !structure.items?.length && !structure.orphanScenes?.length;
    const active = findActiveSection(structure, currentLine);

    // Classes pour surbrillance
    const activeActeClass = "bg-orange-200 text-black";
    const activeSceneClass = "bg-orange-400 text-white font-semibold";
    const defaultActeClass = "hover:bg-orange-100 hover:text-white";
    const defaultSceneClass =
        "text-gray-700 hover:bg-orange-200 hover:text-white hover:font-bold";

    return (
        <div className="h-full flex flex-col w-60 px-6 py-8 gap-y-8">
            <Card header="Sommaire" size="sm" heightMax="flex-1">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full px-3">
                        <p className="text-center text-xs text-gray-500 italic font-ui">
                            Écrivez des actes ou scènes avec '#'
                        </p>
                    </div>
                ) : (
                    <nav className="space-y-2">
                        {/* Scènes orphelines */}
                        {structure.orphanScenes?.map((scene, i) => (
                            <div
                                key={`orphan-${i}`}
                                onClick={() => handleClick(scene.position)}
                                className={`text-left ml-4 px-2 py-1 text-sm rounded font-ui cursor-pointer ${
                                    active.orphanIndex === i
                                        ? activeSceneClass
                                        : defaultSceneClass
                                }`}
                            >
                                {scene.value}
                            </div>
                        ))}

                        {/* Actes avec leurs scènes */}
                        {structure.items?.map((acte, a) => (
                            <ul key={a} className="space-y-1">
                                <li
                                    onClick={() => handleClick(acte.position)}
                                    className={`w-full text-left px-2 py-1 text-sm font-semibold rounded font-ui cursor-pointer ${
                                        active.acteIndex === a
                                            ? activeActeClass
                                            : defaultActeClass
                                    }`}
                                >
                                    {acte.value}
                                </li>
                                {acte.scenes?.length > 0 && (
                                    <ul className="ml-4 space-y-1">
                                        {acte.scenes.map((scene, s) => (
                                            <li
                                                key={s}
                                                onClick={() =>
                                                    handleClick(scene.position)
                                                }
                                                className={`w-full text-left px-2 py-1 text-sm rounded font-ui cursor-pointer ${
                                                    active.acteIndex === a &&
                                                    active.sceneIndex === s
                                                        ? activeSceneClass
                                                        : defaultSceneClass
                                                }`}
                                            >
                                                {scene.value}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </ul>
                        ))}
                    </nav>
                )}
            </Card>

            <Card header="Statistiques" size="sm" heightMax="auto">
                {!statistics ? (
                    <p className="text-sm text-gray-500 italic font-ui">
                        Chargement...
                    </p>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2">
                            <span className="text-sm text-gray-600 font-ui">
                                Scènes
                            </span>
                            <span className="text-lg font-semibold text-orange font-ui">
                                {statistics.totalScenes || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-2">
                            <span className="text-sm text-gray-600 font-ui">
                                Répliques
                            </span>
                            <span className="text-lg font-semibold text-gray-900 font-ui">
                                {statistics.totalRepliques || 0}
                            </span>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
