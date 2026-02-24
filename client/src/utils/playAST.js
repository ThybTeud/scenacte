/**
 * Modèle de données de l'AST pour les pièces de théâtre
 * @module playAST
 */

/**
 * Types de nœuds dans l'AST
 * @enum {string}
 */
export const NodeType = {
  /** Nœud racine de l'arbre */
  ROOT: 'root',
  /** Acte (balise #) */
  SECTION: 'section',
  /** Scène (balise ##) */
  SUBSECTION: 'subsection',
  /** Prise de parole d'un personnage (balise @) */
  SPEECH: 'speech',
  /** Didascalie / indication scénique */
  STAGE_DIRECTION: 'stage_direction',
  /** Ligne de dialogue */
  LINE: 'line',
  /** Fragment de texte brut */
  TEXT_RUN: 'text_run',
  /** Saut de ligne explicite */
  LINE_BREAK: 'line_break'
};

/**
 * Classe représentant un nœud de l'AST
 */
export class ASTNode {
  /**
   * @param {string} type - Type du nœud (voir {@link NodeType})
   * @param {string|null} [value=null] - Valeur textuelle du nœud
   * @param {Object} [attributes={}] - Attributs libres (ex. { speaker, directionType, title })
   * @param {ASTNode[]} [children=[]] - Nœuds enfants
   */
  constructor(type, value = null, attributes = {}, children = []) {
    this.type = type;
    this.value = value;
    this.attributes = attributes;
    this.children = children;
    /** @type {{ start: number, end: number }} Numéros de ligne (base 0) dans le texte source */
    this.position = { start: 0, end: 0 };
  }

  /**
   * Ajoute un nœud enfant
   * @param {ASTNode} node - Nœud à ajouter
   * @returns {ASTNode} this (chaînable)
   */
  addChild(node) {
    this.children.push(node);
    return this;
  }

  /**
   * Sérialise le nœud et ses enfants en objet JSON
   * @returns {{ type: string, value: string|null, attributes: Object, children: Object[], position: { start: number, end: number } }}
   */
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
