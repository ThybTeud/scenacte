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
  SECTION: 'section',
  SUBSECTION: 'subsection',
  SPEECH: 'speech',
  STAGE_DIRECTION: 'stage_direction',
  LINE: 'line',
  TEXT_RUN: 'text_run',
  LINE_BREAK: 'line_break'
};

/**
 * Expression régulière pour détecter les balises
 */
const TAG_PATTERNS = {
  section: /^#(?!#)\s*(.+?)\s*$/i,
  subsection: /^##\s*(.+?)\s*$/i,
  speaker: /^@\s*(.+?)\s*$/i,
  stageDirection: /^\(\s*(.+?)\s*\)$/i
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

    // Contextes hiérarchiques
    let currentActe = null;
    let currentScene = null;
    let currentPersonnage = null;
    let currentSpeaker = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        continue; // Ignorer les lignes vides
      }

      // Vérifier acte (#)
      const acteMatch = TAG_PATTERNS.section.exec(trimmedLine);
      if (acteMatch) {
        const number = acteMatch[1] || '1';
        const node = new ASTNode(NodeType.SECTION, null, { number });
        node.position = { start: i, end: i };
        node.value = acteMatch[1].trim();
        root.addChild(node);

        // Mettre à jour les contextes
        currentActe = node;
        currentScene = null;
        currentPersonnage = null;
        currentSpeaker = null;
        continue;
      }

      // Vérifier scène (##)
      const sceneMatch = TAG_PATTERNS.subsection.exec(trimmedLine);
      if (sceneMatch) {
        const number = sceneMatch[1] || '1';
        const node = new ASTNode(NodeType.SUBSECTION, null, { number });
        node.position = { start: i, end: i };
        node.value = sceneMatch[1].trim();

        // Ajouter la scène au parent approprié
        const parent = this.getParentFor(NodeType.SUBSECTION, currentActe, currentScene, currentPersonnage, root);
        parent.addChild(node);

        // Mettre à jour les contextes
        currentScene = node;
        currentPersonnage = null;
        currentSpeaker = null;
        continue;
      }

      // Vérifier personnage (@)
      const personnageMatch = TAG_PATTERNS.speaker.exec(trimmedLine);
      if (personnageMatch) {
        const name = personnageMatch[1].trim();
        currentSpeaker = name;
        const node = new ASTNode(NodeType.SPEECH, null, { name });
        node.position = { start: i, end: i };

        // Ajouter le personnage au parent approprié
        const parent = this.getParentFor(NodeType.SPEECH, currentActe, currentScene, currentPersonnage, root);
        parent.addChild(node);

        // Mettre à jour le contexte
        currentPersonnage = node;
        continue;
      }

      // Parser la ligne pour les didascalies et le dialogue
      const parsedLine = this.parseLine(trimmedLine, currentSpeaker, i);
      parsedLine.forEach(node => {
        // Ajouter au parent approprié
        const parent = this.getParentFor(node.type, currentActe, currentScene, currentPersonnage, root);
        parent.addChild(node);
      });
    }

    return root;
  }

  /**
   * Détermine le parent approprié pour un type de nœud donné
   * @param {string} type - Type du nœud
   * @param {ASTNode|null} currentActe - Acte courant
   * @param {ASTNode|null} currentScene - Scène courante
   * @param {ASTNode|null} currentPersonnage - Personnage courant
   * @param {ASTNode} root - Nœud racine
   * @returns {ASTNode} - Parent approprié
   */
  getParentFor(type, currentActe, currentScene, currentPersonnage, root) {
    switch(type) {
      case NodeType.SECTION:
        return root;

      case NodeType.SUBSECTION:
        return currentActe || root;

      case NodeType.SPEECH:
        return currentScene || currentActe || root;

      case NodeType.LINE:
      case NodeType.STAGE_DIRECTION:
        return currentPersonnage || currentScene || currentActe || root;

      case NodeType.TEXT_RUN:
        return currentPersonnage || currentScene || currentActe || root;

      default:
        return root;
    }
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
        const node = new ASTNode(NodeType.LINE, line.trim(), { speaker });
        node.position = { start: lineNumber, end: lineNumber };
        nodes.push(node);
      } else {
        const node = new ASTNode(NodeType.TEXT_RUN, line.trim());
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
            const node = new ASTNode(NodeType.LINE, textBefore, { speaker });
            node.position = { start: lineNumber, end: lineNumber };
            nodes.push(node);
          } else {
            const node = new ASTNode(NodeType.TEXT_RUN, textBefore);
            node.position = { start: lineNumber, end: lineNumber };
            nodes.push(node);
          }
        }
      }

      // Didascalie
      const node = new ASTNode(NodeType.STAGE_DIRECTION, didascalie.text);
      node.position = { start: lineNumber, end: lineNumber };
      nodes.push(node);

      lastIndex = didascalie.end;

      // Texte après la dernière didascalie
      if (index === didascalies.length - 1 && lastIndex < line.length) {
        const textAfter = line.substring(lastIndex).trim();
        if (textAfter) {
          if (speaker) {
            const node = new ASTNode(NodeType.LINE, textAfter, { speaker });
            node.position = { start: lineNumber, end: lineNumber };
            nodes.push(node);
          } else {
            const node = new ASTNode(NodeType.TEXT_RUN, textAfter);
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
  if (!ast) {
    return '';
  }

  const renderNode = (node) => {
    // Rendu récursif des enfants
    const childrenHTML = node.children && node.children.length > 0
      ? node.children.map(renderNode).join('')
      : '';

    switch (node.type) {
      case NodeType.ROOT:
        return `<div class="play-root">${childrenHTML}</div>`;

      case NodeType.ACTE:
        return `<div class="acte-container"><h1 class="acte" data-number="${escapeHTML(node.attributes.number)}">${escapeHTML(node.value)}</h1>${childrenHTML}</div>`;

      case NodeType.SCENE:
        return `<div class="scene-container"><h2 class="scene" data-number="${escapeHTML(node.attributes.number)}">${escapeHTML(node.value)}</h2>${childrenHTML}</div>`;

      case NodeType.PERSONNAGE:
        return `<div class="personnage-container"><h3 class="personnage" data-name="${escapeHTML(node.attributes.name)}">${escapeHTML(node.attributes.name)}</h3>${childrenHTML}</div>`;

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
 * @returns {Object} - Structure { items: [], orphanScenes: [], personnages: [] }
 */
export function extractStructure(ast) {
  const result = {
    items: [],           // Actes avec scènes imbriquées
    orphanScenes: [],    // Scènes avant le premier acte
    personnages: new Set()
  };

  let currentActe = null;

  const processNode = (node) => {
    switch (node.type) {
      case NodeType.ACTE:
        currentActe = {
          type: 'acte',
          value: node.value,
          position: node.position,
          scenes: []
        };
        result.items.push(currentActe);
        break;

      case NodeType.SCENE:
        const sceneData = {
          type: 'scene',
          value: node.value,
          position: node.position
        };
        if (currentActe) {
          currentActe.scenes.push(sceneData);
        } else {
          result.orphanScenes.push(sceneData);
        }
        break;

      case NodeType.PERSONNAGE:
        result.personnages.add(node.attributes.name);
        break;

      case NodeType.DIALOGUE:
        if (node.attributes && node.attributes.speaker) {
          result.personnages.add(node.attributes.speaker);
        }
        break;
    }

    if (node.children) {
      node.children.forEach(processNode);
    }
  };

  processNode(ast);

  return {
    ...result,
    personnages: Array.from(result.personnages)
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
