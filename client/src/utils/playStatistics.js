import { PlayParser, NodeType } from './playParser.js';

/**
 * Calcule les statistiques d'une pièce de théâtre à partir d'un AST
 * @param {Object} ast - AST de la pièce (généré par PlayParser)
 * @returns {Object} Statistiques de la pièce
 */
export function calculateStatsFromAST(ast) {
  if (!ast) {
    return {
      totalActs: 0,
      totalScenes: 0,
      totalCharacters: 0,
      totalRepliques: 0,
      wordCount: 0,
      estimatedDurationMinutes: 0
    };
  }

  let totalActs = 0;
  let totalScenes = 0;
  const characters = new Set();
  let totalRepliques = 0;
  let lastSpeaker = null;
  let wordCount = 0;

  /**
   * Parcourt l'AST pour collecter les statistiques
   */
  const traverse = (node) => {
    switch (node.type) {
      case NodeType.ACTE:
      case NodeType.SCENE:
        totalActs += node.type === NodeType.ACTE ? 1 : 0;
        totalScenes += node.type === NodeType.SCENE ? 1 : 0;
        lastSpeaker = null; // Reset au changement de section
        break;

      case NodeType.PERSONNAGE:
        if (node.attributes && node.attributes.name) {
          if (lastSpeaker !== node.attributes.name) {
            totalRepliques++;
            lastSpeaker = node.attributes.name;
          }
          characters.add(node.attributes.name);
        }
        break;

      case NodeType.DIALOGUE:
        if (node.attributes && node.attributes.speaker) {
          characters.add(node.attributes.speaker);
        }
        if (node.value) {
          wordCount += countWords(node.value);
        }
        break;

      case NodeType.DIDASCALIE:
      case NodeType.TEXT:
        if (node.value) {
          wordCount += countWords(node.value);
        }
        break;
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  };

  traverse(ast);

  // Estimation de la durée : environ 150 mots par minute pour une pièce de théâtre
  const estimatedDurationMinutes = Math.ceil(wordCount / 150);

  return {
    totalActs,
    totalScenes,
    totalCharacters: characters.size,
    totalRepliques,
    wordCount,
    estimatedDurationMinutes
  };
}

/**
 * Calcule les statistiques d'une pièce de théâtre à partir du contenu brut
 * @deprecated Utiliser calculateStatsFromAST avec un AST pour éviter le double parsing
 * @param {string} rawContent - Contenu brut de la pièce
 * @returns {Object} Statistiques de la pièce
 */
export function calculatePlayStatistics(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      totalActs: 0,
      totalScenes: 0,
      totalCharacters: 0,
      totalRepliques: 0,
      wordCount: 0,
      estimatedDurationMinutes: 0
    };
  }

  try {
    const parser = new PlayParser();
    const ast = parser.parse(rawContent);
    return calculateStatsFromAST(ast);
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    // En cas d'erreur de parsing, retourner des statistiques basiques
    return {
      totalActs: 0,
      totalScenes: 0,
      totalCharacters: 0,
      totalRepliques: 0,
      wordCount: countWords(rawContent),
      estimatedDurationMinutes: Math.ceil(countWords(rawContent) / 150)
    };
  }
}

/**
 * Compte le nombre de mots dans un texte
 * @param {string} text - Texte à analyser
 * @returns {number} Nombre de mots
 */
function countWords(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // Supprime les espaces multiples et compte les mots
  const words = text.trim().split(/\s+/);
  return words.filter(word => word.length > 0).length;
}

export default {
  calculateStatsFromAST,
  calculatePlayStatistics,
  countWords
};
