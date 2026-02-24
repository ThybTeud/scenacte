/**
 * Parser de balises personnalisées pour les pièces de théâtre
 * Génère un AST (Abstract Syntax Tree) à partir du texte brut
 *
 * Balises supportées :
 * - `#Acte N`       — Marqueur d'acte (N = numéro optionnel)
 * - `##Scène N`     — Marqueur de scène (N = numéro optionnel)
 * - `@PERSONNAGE`   — Marqueur de personnage
 * - `(texte)`       — Didascalies (indications scéniques)
 * - Texte normal    — Dialogue après un personnage
 *
 * @module playParser
 */

import { NodeType, ASTNode } from './playAST.js';

// Ré-export pour compatibilité ascendante — les consommateurs existants
// qui importent depuis playParser continuent de fonctionner.
export { NodeType, ASTNode } from './playAST.js';
export { astToHTML, extractStructure } from './playTransformers.js';

/**
 * Expression régulière pour détecter les balises
 */
const TAG_PATTERNS = {
  section: /^#(?!#)\s*(.+?)\s*$/i,
  subsection: /^##\s*(.+?)\s*$/i,
  speaker: /^@\s*(.+?)\s*$/i,
  stageDirection: /^\(\s*([^)]+)\s*\)$/i,
  preWithText: /^\(([^)]+)\)\s*(.+)$/
};

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
    let currentSection = null;
    let currentSubsection = null;
    let currentSpeech = null;
    let currentSpeaker = null;

    // Tracking pour la classification des didascalies
    let hasSpeechInCurrentContainer = false;
    let isFirstLineInSpeech = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmedLine = lines[i].trim();
      if (!trimmedLine) continue;

      // SECTION (#)
      const sectionMatch = TAG_PATTERNS.section.exec(trimmedLine);
      if (sectionMatch) {
        const title = sectionMatch[1].trim();
        const node = new ASTNode(NodeType.SECTION, title, { title });
        node.position = { start: i, end: i };
        root.addChild(node);
        currentSection = node;
        currentSubsection = null;
        currentSpeech = null;
        currentSpeaker = null;
        hasSpeechInCurrentContainer = false;
        isFirstLineInSpeech = false;
        continue;
      }

      // SUBSECTION (##)
      const subsectionMatch = TAG_PATTERNS.subsection.exec(trimmedLine);
      if (subsectionMatch) {
        const title = subsectionMatch[1].trim();
        const node = new ASTNode(NodeType.SUBSECTION, title, { title });
        node.position = { start: i, end: i };
        this.getParentFor(NodeType.SUBSECTION, currentSection, currentSubsection, root).addChild(node);
        currentSubsection = node;
        currentSpeech = null;
        currentSpeaker = null;
        hasSpeechInCurrentContainer = false;
        isFirstLineInSpeech = false;
        continue;
      }

      // SPEECH (@)
      const speakerMatch = TAG_PATTERNS.speaker.exec(trimmedLine);
      if (speakerMatch) {
        const speaker = speakerMatch[1].trim();
        currentSpeaker = speaker;
        const node = new ASTNode(NodeType.SPEECH, null, { speaker });
        node.position = { start: i, end: i };
        this.getParentFor(NodeType.SPEECH, currentSection, currentSubsection, root).addChild(node);
        currentSpeech = node;
        hasSpeechInCurrentContainer = true;
        isFirstLineInSpeech = true;
        continue;
      }

      // Didascalie ligne entière : (texte)
      const sdMatch = TAG_PATTERNS.stageDirection.exec(trimmedLine);
      if (sdMatch) {
        const sdNode = new ASTNode(NodeType.STAGE_DIRECTION, sdMatch[1].trim());
        sdNode.position = { start: i, end: i };
        if (isFirstLineInSpeech) {
          sdNode.attributes = { directionType: 'pre' };
          currentSpeech.addChild(sdNode);
          isFirstLineInSpeech = false;
        } else if (!hasSpeechInCurrentContainer) {
          sdNode.attributes = { directionType: 'opening' };
          this.getParentFor(NodeType.STAGE_DIRECTION, currentSection, currentSubsection, root).addChild(sdNode);
        } else {
          sdNode.attributes = { directionType: 'between' };
          this.getParentFor(NodeType.STAGE_DIRECTION, currentSection, currentSubsection, root).addChild(sdNode);
        }
        continue;
      }

      // Ligne de contenu (dialogue ou texte libre)
      if (currentSpeaker) {
        if (isFirstLineInSpeech) {
          isFirstLineInSpeech = false;
          const preMatch = TAG_PATTERNS.preWithText.exec(trimmedLine);
          if (preMatch) {
            // Pré-réplique suivie de texte : (pre) texte dialogue
            const preNode = new ASTNode(NodeType.STAGE_DIRECTION, preMatch[1].trim(), { directionType: 'pre' });
            preNode.position = { start: i, end: i };
            currentSpeech.addChild(preNode);
            currentSpeech.addChild(this.parseLine(preMatch[2], currentSpeaker, i));
          } else {
            currentSpeech.addChild(this.parseLine(trimmedLine, currentSpeaker, i));
          }
        } else {
          currentSpeech.addChild(this.parseLine(trimmedLine, currentSpeaker, i));
        }
      } else {
        // Texte libre hors SPEECH
        this.getParentFor(NodeType.STAGE_DIRECTION, currentSection, currentSubsection, root).addChild(
          this.parseLine(trimmedLine, null, i)
        );
      }
    }

    return root;
  }

  /**
   * Détermine le parent approprié pour un type de nœud donné
   * @param {string} type - Type du nœud
   * @param {ASTNode|null} currentSection - Section courante
   * @param {ASTNode|null} currentSubsection - Sous-section courante
   * @param {ASTNode} root - Nœud racine
   * @returns {ASTNode} - Parent approprié
   */
  getParentFor(type, currentSection, currentSubsection, root) {
    switch (type) {
      case NodeType.SECTION:
        return root;

      case NodeType.SUBSECTION:
        return currentSection || root;

      case NodeType.SPEECH:
      case NodeType.STAGE_DIRECTION:
        return currentSubsection || currentSection || root;

      default:
        return root;
    }
  }

  /**
   * Parse une ligne de contenu et retourne un nœud LINE ou TEXT_RUN
   * @param {string} line - Ligne à parser
   * @param {string|null} speaker - Personnage actuel
   * @param {number} lineNumber - Numéro de ligne
   * @returns {ASTNode} - Nœud LINE (avec enfants) ou TEXT_RUN
   */
  parseLine(line, speaker, lineNumber) {
    if (!speaker) {
      const node = new ASTNode(NodeType.TEXT_RUN, line.trim());
      node.position = { start: lineNumber, end: lineNumber };
      return node;
    }

    const lineNode = new ASTNode(NodeType.LINE, null, { speaker });
    lineNode.position = { start: lineNumber, end: lineNumber };

    const intraRegex = /\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = intraRegex.exec(line)) !== null) {
      // Texte avant l'intra-réplique
      if (match.index > lastIndex) {
        const text = line.substring(lastIndex, match.index).trim();
        if (text) {
          const textNode = new ASTNode(NodeType.TEXT_RUN, text);
          textNode.position = { start: lineNumber, end: lineNumber };
          lineNode.addChild(textNode);
        }
      }
      // Intra-réplique
      const sdNode = new ASTNode(NodeType.STAGE_DIRECTION, match[1].trim(), { directionType: 'intra' });
      sdNode.position = { start: lineNumber, end: lineNumber };
      lineNode.addChild(sdNode);
      lastIndex = match.index + match[0].length;
    }

    // Texte restant après la dernière intra-réplique (ou ligne entière si aucune)
    if (lastIndex < line.length) {
      const text = line.substring(lastIndex).trim();
      if (text) {
        const textNode = new ASTNode(NodeType.TEXT_RUN, text);
        textNode.position = { start: lineNumber, end: lineNumber };
        lineNode.addChild(textNode);
      }
    }

    return lineNode;
  }
}

/**
 * Export des utilitaires
 */
export default {
  PlayParser,
  ASTNode,
  NodeType
};
