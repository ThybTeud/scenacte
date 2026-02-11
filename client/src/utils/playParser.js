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
  REPLIQUE: 'replique',
  PERSONNAGE: 'personnage',
  DIDASCALIE: 'didascalie',
  DIALOGUE: 'dialogue',
  TEXT: 'text',
  LINE_BREAK: 'linebreak'
};

/**
 * Types de didascalies selon leur position contextuelle
 */
export const DidascalieType = {
  LIMINAIRE: 'liminaire',           // Après acte/scène, avant première réplique
  INTER_REPLIQUES: 'inter-repliques', // Entre deux répliques
  PRE_REPLIQUE: 'pre-replique',      // Après personnage, avant dialogue
  INTRA_REPLIQUE: 'intra-replique'   // Dans le texte du dialogue
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

    // Contextes hiérarchiques
    let currentActe = null;
    let currentScene = null;
    let currentReplique = null;
    let currentPersonnage = null;
    let justAddedStructure = false; // Acte ou scène vient d'être ajouté

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
        const node = new ASTNode(NodeType.ACTE, acteMatch[1].trim(), { number });
        node.position = { start: i, end: i };
        root.addChild(node);

        // Mettre à jour les contextes
        currentActe = node;
        currentScene = null;
        currentReplique = null;
        currentPersonnage = null;
        justAddedStructure = true;
        continue;
      }

      // Vérifier scène (##)
      const sceneMatch = TAG_PATTERNS.scene.exec(trimmedLine);
      if (sceneMatch) {
        const number = sceneMatch[1] || '1';
        const node = new ASTNode(NodeType.SCENE, sceneMatch[1].trim(), { number });
        node.position = { start: i, end: i };

        // Ajouter la scène au parent approprié
        const parent = currentActe || root;
        parent.addChild(node);

        // Mettre à jour les contextes
        currentScene = node;
        currentReplique = null;
        currentPersonnage = null;
        justAddedStructure = true;
        continue;
      }

      // Vérifier personnage (@)
      const personnageMatch = TAG_PATTERNS.personnage.exec(trimmedLine);
      if (personnageMatch) {
        const name = personnageMatch[1].trim();

        // Créer une nouvelle réplique
        const replique = new ASTNode(NodeType.REPLIQUE);
        replique.position = { start: i, end: i };

        // Ajouter le personnage dans la réplique
        const personnageNode = new ASTNode(NodeType.PERSONNAGE, name, { name });
        personnageNode.position = { start: i, end: i };
        replique.addChild(personnageNode);

        // Ajouter la réplique au parent approprié
        const parent = currentScene || currentActe || root;
        parent.addChild(replique);

        // Mettre à jour les contextes
        currentReplique = replique;
        currentPersonnage = name;
        justAddedStructure = false;
        continue;
      }

      // Vérifier si c'est une didascalie seule (inter-répliques ou liminaire)
      const didascalieSeuleMatch = TAG_PATTERNS.didascalie.exec(trimmedLine);
      if (didascalieSeuleMatch) {
        const content = didascalieSeuleMatch[1].trim();

        // Déterminer le type de didascalie
        let didascalieType;
        if (justAddedStructure) {
          // Juste après un acte ou une scène → liminaire
          didascalieType = DidascalieType.LIMINAIRE;
        } else {
          // Sinon → inter-répliques
          didascalieType = DidascalieType.INTER_REPLIQUES;
        }

        const node = new ASTNode(NodeType.DIDASCALIE, content, { type: didascalieType });
        node.position = { start: i, end: i };

        // Ajouter au parent approprié (scene ou acte, pas replique)
        const parent = currentScene || currentActe || root;
        parent.addChild(node);

        justAddedStructure = false;
        continue;
      }

      // Parser la ligne pour les didascalies et le dialogue
      const parsedNodes = this.parseLine(trimmedLine, currentPersonnage, i);

      if (parsedNodes.length > 0) {
        // Si on a un personnage actif, ajouter à la réplique courante
        if (currentReplique && currentPersonnage) {
          parsedNodes.forEach(node => currentReplique.addChild(node));
        } else {
          // Sinon ajouter comme texte libre au parent
          const parent = currentScene || currentActe || root;
          parsedNodes.forEach(node => parent.addChild(node));
        }

        justAddedStructure = false;
      }
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

    // Si aucune didascalie, traiter comme dialogue simple
    if (didascalies.length === 0) {
      if (speaker) {
        // C'est une réplique simple
        const node = new ASTNode(NodeType.DIALOGUE, line.trim(), { speaker });
        node.position = { start: lineNumber, end: lineNumber };
        nodes.push(node);
      } else {
        // Texte libre
        const node = new ASTNode(NodeType.TEXT, line.trim());
        node.position = { start: lineNumber, end: lineNumber };
        nodes.push(node);
      }
      return nodes;
    }

    // Déterminer si c'est une pré-réplique ou intra-réplique
    const firstDidascalie = didascalies[0];
    const textBeforeFirst = line.substring(0, firstDidascalie.start).trim();

    // Si la ligne commence par une didascalie (ou juste des espaces), c'est une pré-réplique
    const isPreReplique = textBeforeFirst === '';

    if (isPreReplique && didascalies.length === 1 && firstDidascalie.end >= line.trim().length) {
      // Didascalie seule au début → pré-réplique
      const node = new ASTNode(
        NodeType.DIDASCALIE,
        firstDidascalie.text,
        { type: DidascalieType.PRE_REPLIQUE }
      );
      node.position = { start: lineNumber, end: lineNumber };
      nodes.push(node);
      return nodes;
    }

    // Construire le dialogue avec les didascalies intra-réplique
    const fragments = [];
    let lastIndex = 0;

    didascalies.forEach((didascalie, index) => {
      // Texte avant la didascalie
      if (didascalie.start > lastIndex) {
        const textBefore = line.substring(lastIndex, didascalie.start);
        if (textBefore.trim()) {
          fragments.push({
            type: 'text',
            content: textBefore
          });
        }
      }

      // Didascalie (pré-réplique si première et pas de texte avant, sinon intra)
      const type = (index === 0 && lastIndex === 0)
        ? DidascalieType.PRE_REPLIQUE
        : DidascalieType.INTRA_REPLIQUE;

      fragments.push({
        type: 'didascalie',
        content: didascalie.text,
        didascalieType: type
      });

      lastIndex = didascalie.end;
    });

    // Texte après la dernière didascalie
    if (lastIndex < line.length) {
      const textAfter = line.substring(lastIndex);
      if (textAfter.trim()) {
        fragments.push({
          type: 'text',
          content: textAfter
        });
      }
    }

    // Créer un nœud DIALOGUE composite avec les fragments
    const dialogueNode = new ASTNode(NodeType.DIALOGUE, null, {
      speaker,
      fragments: fragments
    });
    dialogueNode.position = { start: lineNumber, end: lineNumber };
    nodes.push(dialogueNode);

    return nodes;
  }
}

/**
 * Convertit l'AST en HTML pour le rendu
 * @param {ASTNode} ast - Nœud racine de l'AST
 * @param {string} layout - Layout à appliquer (centered, inline, marginal)
 * @returns {string} - HTML généré
 */
export function astToHTML(ast, layout = 'centered') {
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
        return `<div class="piece" data-layout="${escapeHTML(layout)}">${childrenHTML}</div>`;

      case NodeType.ACTE:
        return `<section class="acte"><h2>${escapeHTML(node.value)}</h2>${childrenHTML}</section>`;

      case NodeType.SCENE:
        return `<section class="scene"><h3>${escapeHTML(node.value)}</h3>${childrenHTML}</section>`;

      case NodeType.REPLIQUE:
        return `<div class="replique">${childrenHTML}</div>`;

      case NodeType.PERSONNAGE:
        return `<span class="personnage">${escapeHTML(node.value)}</span>`;

      case NodeType.DIDASCALIE: {
        const type = node.attributes.type || DidascalieType.INTER_REPLIQUES;
        const isBlock = type === DidascalieType.LIMINAIRE || type === DidascalieType.INTER_REPLIQUES;
        const tag = isBlock ? 'div' : 'span';
        return `<${tag} class="didascalie" data-type="${type}">${escapeHTML(node.value)}</${tag}>`;
      }

      case NodeType.DIALOGUE: {
        // Si le dialogue a des fragments (avec didascalies intra-réplique)
        if (node.attributes.fragments) {
          const content = node.attributes.fragments.map(frag => {
            if (frag.type === 'text') {
              return escapeHTML(frag.content);
            } else if (frag.type === 'didascalie') {
              const type = frag.didascalieType || DidascalieType.INTRA_REPLIQUE;
              return `<span class="didascalie" data-type="${type}">${escapeHTML(frag.content)}</span>`;
            }
            return '';
          }).join('');
          return `<p class="texte">${content}</p>`;
        }

        // Dialogue simple
        return `<p class="texte">${escapeHTML(node.value)}</p>`;
      }

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
  if (text === null || text === undefined) {
    return '';
  }
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
        result.personnages.add(node.value);
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
  DidascalieType,
  astToHTML,
  extractStructure
};
