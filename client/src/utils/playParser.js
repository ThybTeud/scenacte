/**
 * Parser de balises personnalisées pour les pièces de théâtre
 * Génère un AST (Abstract Syntax Tree) à partir du texte brut
 *
 * Balises supportées :
 * - [acte:N] - Marqueur d'acte (N = numéro)
 * - [scene:N] - Marqueur de scène (N = numéro)
 * - [personnage:NOM] - Marqueur de personnage
 * - [didascalie]texte[/didascalie] - Didascalies (indications scéniques)
 * - [dialogue:NOM]texte[/dialogue] - Dialogue d'un personnage
 * - [tirade:NOM]texte[/tirade] - Tirade (long monologue)
 * - [aparté:NOM]texte[/aparté] - Aparté (texte dit à part)
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
  TIRADE: 'tirade',
  APARTE: 'aparte',
  TEXT: 'text',
  LINE_BREAK: 'linebreak'
};

/**
 * Expression régulière pour détecter les balises
 */
const TAG_PATTERNS = {
  acte: /\[acte:(\d+)\]/gi,
  scene: /\[scene:(\d+)\]/gi,
  personnage: /\[personnage:([^\]]+)\]/gi,
  didascalie: /\[didascalie\](.*?)\[\/didascalie\]/gis,
  dialogue: /\[dialogue:([^\]]+)\](.*?)\[\/dialogue\]/gis,
  tirade: /\[tirade:([^\]]+)\](.*?)\[\/tirade\]/gis,
  aparte: /\[aparté:([^\]]+)\](.*?)\[\/aparté\]/gis
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
    const tokens = this.tokenize(text);

    tokens.forEach(token => {
      root.addChild(token);
    });

    return root;
  }

  /**
   * Tokenize le texte en identifiant toutes les balises
   * @param {string} text - Texte à tokenizer
   * @returns {ASTNode[]} - Liste de nœuds AST
   */
  tokenize(text) {
    const tokens = [];
    const matches = [];

    // Collecter toutes les correspondances de balises
    Object.entries(TAG_PATTERNS).forEach(([type, pattern]) => {
      let match;
      const regex = new RegExp(pattern);

      while ((match = regex.exec(text)) !== null) {
        matches.push({
          type,
          match: match[0],
          groups: match.slice(1),
          start: match.index,
          end: match.index + match[0].length
        });
      }
    });

    // Trier par position
    matches.sort((a, b) => a.start - b.start);

    let lastIndex = 0;

    matches.forEach(({ type, groups, start, end }) => {
      // Ajouter le texte avant la balise
      if (start > lastIndex) {
        const textBefore = text.substring(lastIndex, start);
        if (textBefore.trim()) {
          const textNode = new ASTNode(NodeType.TEXT, textBefore.trim());
          textNode.position = { start: lastIndex, end: start };
          tokens.push(textNode);
        }
      }

      // Créer le nœud pour la balise
      const node = this.createNodeFromMatch(type, groups);
      node.position = { start, end };
      tokens.push(node);

      lastIndex = end;
    });

    // Ajouter le texte restant
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      if (textAfter.trim()) {
        const textNode = new ASTNode(NodeType.TEXT, textAfter.trim());
        textNode.position = { start: lastIndex, end: text.length };
        tokens.push(textNode);
      }
    }

    return tokens;
  }

  /**
   * Crée un nœud AST à partir d'une correspondance de regex
   * @param {string} type - Type de balise
   * @param {string[]} groups - Groupes capturés de la regex
   * @returns {ASTNode} - Nœud AST créé
   */
  createNodeFromMatch(type, groups) {
    switch (type) {
      case 'acte':
        return new ASTNode(NodeType.ACTE, null, { number: parseInt(groups[0], 10) });

      case 'scene':
        return new ASTNode(NodeType.SCENE, null, { number: parseInt(groups[0], 10) });

      case 'personnage':
        return new ASTNode(NodeType.PERSONNAGE, null, { name: groups[0].trim() });

      case 'didascalie':
        return new ASTNode(NodeType.DIDASCALIE, groups[0].trim());

      case 'dialogue':
        return new ASTNode(NodeType.DIALOGUE, groups[1].trim(), { speaker: groups[0].trim() });

      case 'tirade':
        return new ASTNode(NodeType.TIRADE, groups[1].trim(), { speaker: groups[0].trim() });

      case 'aparte':
        return new ASTNode(NodeType.APARTE, groups[1].trim(), { speaker: groups[0].trim() });

      default:
        return new ASTNode(NodeType.TEXT, groups.join(' '));
    }
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
        return `<h1 class="acte" data-number="${node.attributes.number}">ACTE ${node.attributes.number}</h1>`;

      case NodeType.SCENE:
        return `<h2 class="scene" data-number="${node.attributes.number}">Scène ${node.attributes.number}</h2>`;

      case NodeType.PERSONNAGE:
        return `<h3 class="personnage" data-name="${node.attributes.name}">${node.attributes.name}</h3>`;

      case NodeType.DIDASCALIE:
        return `<p class="didascalie"><em>${escapeHTML(node.value)}</em></p>`;

      case NodeType.DIALOGUE:
        return `
          <div class="dialogue" data-speaker="${node.attributes.speaker}">
            <strong class="speaker">${escapeHTML(node.attributes.speaker)}</strong>
            <p class="dialogue-text">${escapeHTML(node.value)}</p>
          </div>
        `;

      case NodeType.TIRADE:
        return `
          <div class="tirade" data-speaker="${node.attributes.speaker}">
            <strong class="speaker">${escapeHTML(node.attributes.speaker)}</strong>
            <div class="tirade-text">${escapeHTML(node.value)}</div>
          </div>
        `;

      case NodeType.APARTE:
        return `
          <div class="aparte" data-speaker="${node.attributes.speaker}">
            <strong class="speaker">${escapeHTML(node.attributes.speaker)}</strong>
            <p class="aparte-text">${escapeHTML(node.value)}</p>
          </div>
        `;

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
          position: node.position
        });
        break;

      case NodeType.SCENE:
        structure.scenes.push({
          number: node.attributes.number,
          position: node.position
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
