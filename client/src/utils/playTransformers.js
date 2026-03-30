/**
 * Transformations de l'AST vers d'autres formats
 * Fonctions qui prennent un AST en entrée et produisent une sortie dérivée
 *
 * @module playTransformers
 */

import { NodeType } from './playAST.js';

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

      case NodeType.SECTION: {
        const hasSubsections = node.children && node.children.some(c => c.type === NodeType.SUBSECTION);
        let sectionCharListHTML = '';
        if (!hasSubsections) {
          const characters = extractSceneCharacters(node);
          sectionCharListHTML = characters.length > 0
            ? `<p class="scene-personnages" data-line="${node.position.start}">${characters.map(c => escapeHTML(c)).join(', ')}</p>`
            : '';
        }
        return `<div class="acte-container"><h1 class="acte" data-line="${node.position.start}">${escapeHTML(node.value)}</h1>${sectionCharListHTML}${childrenHTML}</div>`;
      }

      case NodeType.SUBSECTION: {
        const characters = extractSceneCharacters(node);
        const charListHTML = characters.length > 0
          ? `<p class="scene-personnages" data-line="${node.position.start}">${characters.map(c => escapeHTML(c)).join(', ')}</p>`
          : '';
        return `<div class="scene-container"><h2 class="scene" data-line="${node.position.start}">${escapeHTML(node.value)}</h2>${charListHTML}${childrenHTML}</div>`;
      }

      case NodeType.SPEECH:
        return `<div class="personnage-container"><h3 class="personnage" data-name="${escapeHTML(node.attributes.speaker)}" data-line="${node.position.start}">${escapeHTML(node.attributes.speaker)}</h3>${childrenHTML}</div>`;

      case NodeType.STAGE_DIRECTION: {
        const dtype = node.attributes.directionType || 'between';
        if (dtype === 'intra') {
          return `<span class="didascalie" data-type="${dtype}" data-line="${node.position.start}">${escapeHTML(node.value)}</span>`;
        }
        return `<p class="didascalie" data-type="${dtype}" data-line="${node.position.start}">${escapeHTML(node.value)}</p>`;
      }

      case NodeType.LINE:
        return `<p class="dialogue" data-speaker="${escapeHTML(node.attributes.speaker)}" data-line="${node.position.start}">${childrenHTML}</p>`;

      case NodeType.LINE_BREAK:
        return '<br>';

      case NodeType.TEXT_RUN:
        return escapeHTML(node.value);

      default:
        return '';
    }
  };

  return renderNode(ast);
}

/**
 * Extrait les personnages uniques d'un nœud scène (ordre de première apparition)
 * @param {ASTNode} node - Nœud SUBSECTION
 * @returns {string[]} - Noms des personnages
 */
function extractSceneCharacters(node) {
  const characters = [];
  const seen = new Set();
  const walk = (n) => {
    if (n.type === NodeType.SPEECH && !seen.has(n.attributes.speaker)) {
      seen.add(n.attributes.speaker);
      characters.push(n.attributes.speaker);
    }
    if (n.children) n.children.forEach(walk);
  };
  walk(node);
  return characters;
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

  let currentSection = null;

  const processNode = (node) => {
    switch (node.type) {
      case NodeType.SECTION:
        currentSection = {
          type: 'acte',
          value: node.value,
          position: node.position,
          scenes: []
        };
        result.items.push(currentSection);
        break;

      case NodeType.SUBSECTION: {
        const sceneData = {
          type: 'scene',
          value: node.value,
          position: node.position
        };
        if (currentSection) {
          currentSection.scenes.push(sceneData);
        } else {
          result.orphanScenes.push(sceneData);
        }
        break;
      }

      case NodeType.SPEECH:
        result.personnages.add(node.attributes.speaker);
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
