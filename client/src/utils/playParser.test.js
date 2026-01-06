import { describe, it, expect } from 'vitest';
import { PlayParser, ASTNode, NodeType, astToHTML, extractStructure } from './playParser';

describe('PlayParser', () => {
  describe('parsing actes', () => {
    it('should parse a single act', () => {
      const parser = new PlayParser();
      const text = '#Acte I';
      const ast = parser.parse(text);

      expect(ast.type).toBe(NodeType.ROOT);
      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.ACTE);
      expect(ast.children[0].value).toBe('Acte I');
      expect(ast.children[0].attributes.number).toBe('Acte I');
    });

    it('should parse multiple acts', () => {
      const parser = new PlayParser();
      const text = `#Acte I
#Acte II
#Acte III`;
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(3);
      expect(ast.children.every(node => node.type === NodeType.ACTE)).toBe(true);
      expect(ast.children[0].value).toBe('Acte I');
      expect(ast.children[1].value).toBe('Acte II');
      expect(ast.children[2].value).toBe('Acte III');
    });

    it('should handle acts with extra whitespace', () => {
      const parser = new PlayParser();
      const text = '#   Acte I   ';
      const ast = parser.parse(text);

      expect(ast.children[0].type).toBe(NodeType.ACTE);
      expect(ast.children[0].value).toBe('Acte I');
    });
  });

  describe('parsing scènes', () => {
    it('should parse a single scene', () => {
      const parser = new PlayParser();
      const text = '##Scène 1';
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.SCENE);
      expect(ast.children[0].value).toBe('Scène 1');
      expect(ast.children[0].attributes.number).toBe('Scène 1');
    });

    it('should nest scenes inside acts', () => {
      const parser = new PlayParser();
      const text = `#Acte I
##Scène 1
##Scène 2`;
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.ACTE);
      expect(ast.children[0].children).toHaveLength(2);
      expect(ast.children[0].children[0].type).toBe(NodeType.SCENE);
      expect(ast.children[0].children[1].type).toBe(NodeType.SCENE);
    });

    it('should handle orphan scenes (before first act)', () => {
      const parser = new PlayParser();
      const text = `##Scène 1
#Acte I
##Scène 2`;
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].type).toBe(NodeType.SCENE);
      expect(ast.children[1].type).toBe(NodeType.ACTE);
      expect(ast.children[1].children[0].type).toBe(NodeType.SCENE);
    });

    it('should handle scenes with extra whitespace', () => {
      const parser = new PlayParser();
      const text = '##  Scène 1  ';
      const ast = parser.parse(text);

      expect(ast.children[0].type).toBe(NodeType.SCENE);
      expect(ast.children[0].value).toBe('Scène 1');
    });
  });

  describe('parsing personnages', () => {
    it('should parse a character declaration', () => {
      const parser = new PlayParser();
      const text = '@HAMLET';
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.PERSONNAGE);
      expect(ast.children[0].attributes.name).toBe('HAMLET');
    });

    it('should nest characters inside scenes', () => {
      const parser = new PlayParser();
      const text = `##Scène 1
@HAMLET
@OPHÉLIE`;
      const ast = parser.parse(text);

      expect(ast.children[0].type).toBe(NodeType.SCENE);
      expect(ast.children[0].children).toHaveLength(2);
      expect(ast.children[0].children[0].type).toBe(NodeType.PERSONNAGE);
      expect(ast.children[0].children[1].type).toBe(NodeType.PERSONNAGE);
    });

    it('should handle character names with special characters', () => {
      const parser = new PlayParser();
      const text = '@LE ROI';
      const ast = parser.parse(text);

      expect(ast.children[0].attributes.name).toBe('LE ROI');
    });
  });

  describe('parsing didascalies', () => {
    it('should parse a standalone didascalie', () => {
      const parser = new PlayParser();
      const text = '(Il entre)';
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.DIDASCALIE);
      expect(ast.children[0].value).toBe('Il entre');
    });

    it('should parse didascalies within dialogue', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
Être ou ne pas être (il hésite) telle est la question`;
      const ast = parser.parse(text);

      const personnage = ast.children[0];
      expect(personnage.type).toBe(NodeType.PERSONNAGE);
      expect(personnage.children).toHaveLength(3);
      expect(personnage.children[0].type).toBe(NodeType.DIALOGUE);
      expect(personnage.children[0].value).toBe('Être ou ne pas être');
      expect(personnage.children[1].type).toBe(NodeType.DIDASCALIE);
      expect(personnage.children[1].value).toBe('il hésite');
      expect(personnage.children[2].type).toBe(NodeType.DIALOGUE);
      expect(personnage.children[2].value).toBe('telle est la question');
    });

    it('should handle multiple didascalies in one line', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
(il entre) Bonjour (il salue)`;
      const ast = parser.parse(text);

      const personnage = ast.children[0];
      expect(personnage.children).toHaveLength(3);
      expect(personnage.children[0].type).toBe(NodeType.DIDASCALIE);
      expect(personnage.children[1].type).toBe(NodeType.DIALOGUE);
      expect(personnage.children[2].type).toBe(NodeType.DIDASCALIE);
    });

    it('should handle didascalies with special characters', () => {
      const parser = new PlayParser();
      const text = '(Il s\'approche d\'elle, lentement)';
      const ast = parser.parse(text);

      expect(ast.children[0].type).toBe(NodeType.DIDASCALIE);
      expect(ast.children[0].value).toBe('Il s\'approche d\'elle, lentement');
    });
  });

  describe('parsing dialogues', () => {
    it('should parse dialogue after character', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
Être ou ne pas être`;
      const ast = parser.parse(text);

      const personnage = ast.children[0];
      expect(personnage.children).toHaveLength(1);
      expect(personnage.children[0].type).toBe(NodeType.DIALOGUE);
      expect(personnage.children[0].value).toBe('Être ou ne pas être');
      expect(personnage.children[0].attributes.speaker).toBe('HAMLET');
    });

    it('should parse multiple dialogue lines for same character', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
Être ou ne pas être
Telle est la question`;
      const ast = parser.parse(text);

      const personnage = ast.children[0];
      expect(personnage.children).toHaveLength(2);
      expect(personnage.children[0].type).toBe(NodeType.DIALOGUE);
      expect(personnage.children[1].type).toBe(NodeType.DIALOGUE);
      expect(personnage.children[0].attributes.speaker).toBe('HAMLET');
      expect(personnage.children[1].attributes.speaker).toBe('HAMLET');
    });

    it('should handle alternating speakers', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
Bonjour Ophélie
@OPHÉLIE
Bonjour mon prince`;
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].children[0].attributes.speaker).toBe('HAMLET');
      expect(ast.children[1].children[0].attributes.speaker).toBe('OPHÉLIE');
    });
  });

  describe('edge cases', () => {
    it('should handle empty text', () => {
      const parser = new PlayParser();
      const ast = parser.parse('');

      expect(ast.type).toBe(NodeType.ROOT);
      expect(ast.children).toHaveLength(0);
    });

    it('should handle text with only whitespace', () => {
      const parser = new PlayParser();
      const ast = parser.parse('   \n  \n  ');

      expect(ast.type).toBe(NodeType.ROOT);
      expect(ast.children).toHaveLength(0);
    });

    it('should handle plain text without any tags', () => {
      const parser = new PlayParser();
      const text = 'This is plain text';
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.TEXT);
      expect(ast.children[0].value).toBe('This is plain text');
    });

    it('should ignore empty lines', () => {
      const parser = new PlayParser();
      const text = `#Acte I

##Scène 1

@HAMLET`;
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].children).toHaveLength(1);
      expect(ast.children[0].children[0].children).toHaveLength(1);
    });

    it('should handle incomplete tags gracefully', () => {
      const parser = new PlayParser();
      const text = `# Acte
## Scène
@ Personnage`;
      const ast = parser.parse(text);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.ACTE);
      expect(ast.children[0].children).toHaveLength(1);
      expect(ast.children[0].children[0].type).toBe(NodeType.SCENE);
      expect(ast.children[0].children[0].children).toHaveLength(1);
      expect(ast.children[0].children[0].children[0].type).toBe(NodeType.PERSONNAGE);
    });
  });

  describe('complex structure', () => {
    it('should parse a complete play structure', () => {
      const parser = new PlayParser();
      const text = `#Acte I
##Scène 1
@HAMLET
(Il entre) Être ou ne pas être
Telle est la question
@OPHÉLIE
Mon prince
##Scène 2
@LE ROI
(à part) Que se passe-t-il ?`;

      const ast = parser.parse(text);

      expect(ast.type).toBe(NodeType.ROOT);
      expect(ast.children).toHaveLength(1);

      const acte = ast.children[0];
      expect(acte.type).toBe(NodeType.ACTE);
      expect(acte.children).toHaveLength(2);

      const scene1 = acte.children[0];
      expect(scene1.type).toBe(NodeType.SCENE);
      expect(scene1.children).toHaveLength(2);

      const scene2 = acte.children[1];
      expect(scene2.type).toBe(NodeType.SCENE);
      expect(scene2.children).toHaveLength(1);
    });
  });
});

describe('ASTNode', () => {
  it('should create a node with proper structure', () => {
    const node = new ASTNode(NodeType.ACTE, 'Acte I', { number: '1' });

    expect(node.type).toBe(NodeType.ACTE);
    expect(node.value).toBe('Acte I');
    expect(node.attributes.number).toBe('1');
    expect(node.children).toEqual([]);
    expect(node.position).toEqual({ start: 0, end: 0 });
  });

  it('should add children correctly', () => {
    const parent = new ASTNode(NodeType.ACTE);
    const child = new ASTNode(NodeType.SCENE);

    parent.addChild(child);

    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(child);
  });

  it('should convert to JSON correctly', () => {
    const node = new ASTNode(NodeType.ACTE, 'Acte I', { number: '1' });
    const child = new ASTNode(NodeType.SCENE, 'Scène 1', { number: '1' });
    node.addChild(child);

    const json = node.toJSON();

    expect(json.type).toBe(NodeType.ACTE);
    expect(json.value).toBe('Acte I');
    expect(json.attributes.number).toBe('1');
    expect(json.children).toHaveLength(1);
    expect(json.children[0].type).toBe(NodeType.SCENE);
  });
});

describe('extractStructure', () => {
  it('should extract acts and scenes', () => {
    const parser = new PlayParser();
    const text = `#Acte I
##Scène 1
##Scène 2
#Acte II
##Scène 1`;

    const ast = parser.parse(text);
    const structure = extractStructure(ast);

    expect(structure.items).toHaveLength(2);
    expect(structure.items[0].type).toBe('acte');
    expect(structure.items[0].scenes).toHaveLength(2);
    expect(structure.items[1].type).toBe('acte');
    expect(structure.items[1].scenes).toHaveLength(1);
  });

  it('should extract orphan scenes', () => {
    const parser = new PlayParser();
    const text = `##Scène Prologue
#Acte I
##Scène 1`;

    const ast = parser.parse(text);
    const structure = extractStructure(ast);

    expect(structure.orphanScenes).toHaveLength(1);
    expect(structure.orphanScenes[0].value).toBe('Scène Prologue');
  });

  it('should extract character names', () => {
    const parser = new PlayParser();
    const text = `@HAMLET
Être ou ne pas être
@OPHÉLIE
Mon prince
@HAMLET
Telle est la question`;

    const ast = parser.parse(text);
    const structure = extractStructure(ast);

    expect(structure.personnages).toContain('HAMLET');
    expect(structure.personnages).toContain('OPHÉLIE');
    expect(structure.personnages).toHaveLength(2);
  });

  it('should extract characters from dialogue attributes', () => {
    const parser = new PlayParser();
    const text = `@LE ROI
(au garde) Allez chercher Hamlet`;

    const ast = parser.parse(text);
    const structure = extractStructure(ast);

    expect(structure.personnages).toContain('LE ROI');
  });

  it('should handle empty AST', () => {
    const parser = new PlayParser();
    const ast = parser.parse('');
    const structure = extractStructure(ast);

    expect(structure.items).toHaveLength(0);
    expect(structure.orphanScenes).toHaveLength(0);
    expect(structure.personnages).toHaveLength(0);
  });
});
