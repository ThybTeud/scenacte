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
