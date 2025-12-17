/**
 * Parser de balises personnalisées pour les pièces de théâtre
 * Génère un AST (Abstract Syntax Tree) à partir du texte brut
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
export const NodeType = {
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
export class ASTNode {
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
export class PlayParser {
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
        const name = personnageMatch[1].trim();
        currentSpeaker = name;
        const node = new ASTNode(NodeType.PERSONNAGE, null, { name });
        node.position = { start: i, end: i };
        root.addChild(node);
        continue;
      }

      /*
      J'ai l'impression qu'il manque le parsing de didascalies ici. 
      */
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
 * Convertit l'AST en HTML pour le rendu
 * @param {ASTNode} ast - Nœud racine de l'AST
 * @returns {string} - HTML généré
 */
export function astToHTML(ast) {
  if (!ast || !ast.children) {
    return '';
  }

  const renderNode = (node) => {
    switch (node.type) {
      case NodeType.ROOT:
        return `<div class="play-root">${node.children.map(renderNode).join('')}</div>`;

      case NodeType.ACTE:
        return `<h1 class="acte" data-number="${escapeHTML(node.attributes.number)}">${escapeHTML(node.value)}</h1>`;

      case NodeType.SCENE:
        return `<h2 class="scene" data-number="${escapeHTML(node.attributes.number)}">${escapeHTML(node.value)}</h2>`;

      case NodeType.PERSONNAGE:
        return `<h3 class="personnage" data-name="${escapeHTML(node.attributes.name)}">${escapeHTML(node.attributes.name)}</h3>`;

      case NodeType.DIDASCALIE:
        return `<p class="didascalie"><em>${escapeHTML(node.value)}</em></p>`;

      case NodeType.DIALOGUE:
        return `<p class="dialogue" data-speaker="${escapeHTML(node.attributes.speaker)}">${escapeHTML(node.value)}</p>`;

      case NodeType.TEXT:
        return `<p class="text">${escapeHTML(node.value)}</p>`;

      default:
        return '';
    }
  };

  return renderNode(ast);
}

/**
 * Échappe les caractères HTML
 * @param {string} text - Texte à échapper
 * @returns {string} - Texte échappé
 */
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Extrait les informations structurelles de l'AST
 * (utile pour la navigation)
 * @param {ASTNode} ast - Nœud racine de l'AST
 * @returns {Object} - Structure { actes: [], scenes: [], personnages: [] }
 */
export function extractStructure(ast) {
  const structure = {
    actes: [],
    scenes: [],
    personnages: new Set()
  };

  const traverse = (node) => {
    switch (node.type) {
      case NodeType.ACTE:
        structure.actes.push({
          number: node.attributes.number,
          position: node.position,
          value: node.value
        });
        break;

      case NodeType.SCENE:
        structure.scenes.push({
          number: node.attributes.number,
          position: node.position,
          value: node.value
        });
        break;

      case NodeType.PERSONNAGE:
        structure.personnages.add(node.attributes.name);
        break;

      case NodeType.DIALOGUE:
      case NodeType.TIRADE:
      case NodeType.APARTE:
        structure.personnages.add(node.attributes.speaker);
        break;
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  traverse(ast);

  return {
    ...structure,
    personnages: Array.from(structure.personnages)
  };
}

/**
 * Export des utilitaires
 */
export default {
  PlayParser,
  ASTNode,
  NodeType,
  astToHTML,
  extractStructure
};
