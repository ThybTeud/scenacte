/**
 * Parser et calcul de statistiques pour les pièces de théâtre
 * Version serveur (sans dépendances DOM)
 *
 * Balises supportées :
 * - #Acte N - Marqueur d'acte (N = numéro optionnel)
 * - ##Scène N - Marqueur de scène (N = numéro optionnel)
 * - @PERSONNAGE - Marqueur de personnage
 * - (texte) - Didascalies (indications scéniques)
 * - Texte normal - Dialogue après un personnage
 */

/**
 * Types de nœuds dans l'AST
 */
const NodeType = {
  ROOT: 'root',
  ACTE: 'acte',
  SCENE: 'scene',
  PERSONNAGE: 'personnage',
  DIDASCALIE: 'didascalie',
  DIALOGUE: 'dialogue',
  TEXT: 'text',
  LINE_BREAK: 'linebreak'
};

/**
 * Expression régulière pour détecter les balises
 */
const TAG_PATTERNS = {
  acte: /^#(?!#)\s*(.+?)\s*$/i,
  scene: /^##\s*(.+?)\s*$/mi,
  personnage: /^@\s*(.+?)\s*$/mi,
  didascalie: /^\(\s*(.+?)\s*\)$/i
};

/**
 * Classe représentant un nœud de l'AST
 */
class ASTNode {
  constructor(type, value = null, attributes = {}, children = []) {
    this.type = type;
    this.value = value;
    this.attributes = attributes;
    this.children = children;
    this.position = { start: 0, end: 0 };
  }

  addChild(node) {
    this.children.push(node);
    return this;
  }

  toJSON() {
    return {
      type: this.type,
      value: this.value,
      attributes: this.attributes,
      children: this.children.map(child => child.toJSON()),
      position: this.position
    };
  }
}

/**
 * Parser principal
 */
class PlayParser {
  constructor() {
    this.position = 0;
    this.text = '';
  }

  /**
   * Parse le texte et retourne l'AST
   * @param {string} text - Texte brut à parser
   * @returns {ASTNode} - Nœud racine de l'AST
   */
  parse(text) {
    this.text = text;
    this.position = 0;

    const root = new ASTNode(NodeType.ROOT);
    const lines = text.split('\n');
    let currentSpeaker = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        continue; // Ignorer les lignes vides
      }

      // Vérifier acte (#)
      const acteMatch = TAG_PATTERNS.acte.exec(trimmedLine);
      if (acteMatch) {
        const number = acteMatch[1] || '1';
        const node = new ASTNode(NodeType.ACTE, null, { number });
        node.position = { start: i, end: i };
        node.value = acteMatch[1].trim();
        root.addChild(node);
        currentSpeaker = null;
        continue;
      }

      // Vérifier scène (##)
      const sceneMatch = TAG_PATTERNS.scene.exec(trimmedLine);
      if (sceneMatch) {
        const number = sceneMatch[1] || '1';
        const node = new ASTNode(NodeType.SCENE, null, { number });
        node.position = { start: i, end: i };
        node.value = sceneMatch[1].trim();
        root.addChild(node);
        currentSpeaker = null;
        continue;
      }

      // Vérifier personnage (@)
      const personnageMatch = TAG_PATTERNS.personnage.exec(trimmedLine);
      if (personnageMatch) {
        const name = personnageMatch[1].trim().toUpperCase();
        currentSpeaker = name;
        const node = new ASTNode(NodeType.PERSONNAGE, null, { name });
        node.position = { start: i, end: i };
        root.addChild(node);
        continue;
      }

      // Parser la ligne pour les didascalies et le dialogue
      const parsedLine = this.parseLine(trimmedLine, currentSpeaker, i);
      parsedLine.forEach(node => root.addChild(node));
    }

    return root;
  }

  /**
   * Parse une ligne pour extraire les didascalies et le dialogue
   * @param {string} line - Ligne à parser
   * @param {string|null} speaker - Personnage actuel
   * @param {number} lineNumber - Numéro de ligne
   * @returns {ASTNode[]} - Liste de nœuds
   */
  parseLine(line, speaker, lineNumber) {
    const nodes = [];
    let lastIndex = 0;
    const didascalieRegex = /\(([^)]+)\)/g;
    let match;

    // Extraire toutes les didascalies
    const didascalies = [];
    while ((match = didascalieRegex.exec(line)) !== null) {
      didascalies.push({
        text: match[1].trim(),
        start: match.index,
        end: match.index + match[0].length
      });
    }

    if (didascalies.length === 0) {
      // Pas de didascalie, traiter comme dialogue ou texte
      if (speaker) {
        const node = new ASTNode(NodeType.DIALOGUE, line.trim(), { speaker });
        node.position = { start: lineNumber, end: lineNumber };
        nodes.push(node);
      } else {
        const node = new ASTNode(NodeType.TEXT, line.trim());
        node.position = { start: lineNumber, end: lineNumber };
        nodes.push(node);
      }
      return nodes;
    }

    // Traiter les didascalies et le texte entre elles
    didascalies.forEach((didascalie, index) => {
      // Texte avant la didascalie
      if (didascalie.start > lastIndex) {
        const textBefore = line.substring(lastIndex, didascalie.start).trim();
        if (textBefore) {
          if (speaker) {
            const node = new ASTNode(NodeType.DIALOGUE, textBefore, { speaker });
            node.position = { start: lineNumber, end: lineNumber };
            nodes.push(node);
          } else {
            const node = new ASTNode(NodeType.TEXT, textBefore);
            node.position = { start: lineNumber, end: lineNumber };
            nodes.push(node);
          }
        }
      }

      // Didascalie
      const node = new ASTNode(NodeType.DIDASCALIE, didascalie.text);
      node.position = { start: lineNumber, end: lineNumber };
      nodes.push(node);

      lastIndex = didascalie.end;

      // Texte après la dernière didascalie
      if (index === didascalies.length - 1 && lastIndex < line.length) {
        const textAfter = line.substring(lastIndex).trim();
        if (textAfter) {
          if (speaker) {
            const node = new ASTNode(NodeType.DIALOGUE, textAfter, { speaker });
            node.position = { start: lineNumber, end: lineNumber };
            nodes.push(node);
          } else {
            const node = new ASTNode(NodeType.TEXT, textAfter);
            node.position = { start: lineNumber, end: lineNumber };
            nodes.push(node);
          }
        }
      }
    });

    return nodes;
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

/**
 * Calcule les statistiques d'une pièce de théâtre à partir du contenu brut
 * @param {string} rawContent - Contenu brut de la pièce
 * @returns {Object} Statistiques de la pièce
 */
export function calculatePlayStatistics(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      totalActs: 0,
      totalScenes: 0,
      totalCharacters: 0,
      totalLines: 0,
      wordCount: 0,
      estimatedDurationMinutes: 0
    };
  }

  try {
    const parser = new PlayParser();
    const ast = parser.parse(rawContent);

    let totalActs = 0;
    let totalScenes = 0;
    const characters = new Set();
    let totalLines = 0;
    let wordCount = 0;

    /**
     * Parcourt l'AST pour collecter les statistiques
     */
    const traverse = (node) => {
      switch (node.type) {
        case NodeType.ACTE:
          totalActs++;
          break;

        case NodeType.SCENE:
          totalScenes++;
          break;

        case NodeType.PERSONNAGE:
          if (node.attributes && node.attributes.name) {
            characters.add(node.attributes.name);
          }
          break;

        case NodeType.DIALOGUE:
          totalLines++;
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
      totalLines,
      wordCount,
      estimatedDurationMinutes
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    // En cas d'erreur de parsing, retourner des statistiques basiques
    return {
      totalActs: 0,
      totalScenes: 0,
      totalCharacters: 0,
      totalLines: 0,
      wordCount: countWords(rawContent),
      estimatedDurationMinutes: Math.ceil(countWords(rawContent) / 150)
    };
  }
}

export { PlayParser, ASTNode, NodeType };

export default {
  calculatePlayStatistics,
  countWords
};
