import { useMemo } from "react";
import { PlayParser } from "../utils/playParser";
import { astToHTML, extractStructure } from "../utils/playTransformers";
import { calculateStatsFromAST } from "../utils/playStatistics";

/**
 * Hook qui parse le contenu de la pièce et retourne l'AST, la structure, les statistiques et le HTML
 * Parse l'AST une seule fois et dérive toutes les valeurs nécessaires
 * @param {string} content - Le contenu brut de la pièce
 * @param {PlayParser} parser - Instance du parser
 * @returns {Object} { ast, structure, statistics, htmlContent }
 */
export function usePlayParsing(content, parser) {
    return useMemo(() => {
        if (!content) {
            return {
                ast: null,
                structure: { items: [], orphanScenes: [], personnages: [] },
                statistics: null,
                htmlContent: "",
            };
        }

        try {
            // Parse l'AST une seule fois
            const ast = parser.parse(content);

            // Dérive toutes les valeurs nécessaires depuis l'AST
            const structure = extractStructure(ast);
            const statistics = calculateStatsFromAST(ast);
            const htmlContent = astToHTML(ast);

            return {
                ast,
                structure,
                statistics,
                htmlContent,
            };
        } catch (error) {
            console.error("Erreur lors du parsing:", error);
            return {
                ast: null,
                structure: { items: [], orphanScenes: [], personnages: [] },
                statistics: null,
                htmlContent: "",
            };
        }
    }, [content, parser]);
}
