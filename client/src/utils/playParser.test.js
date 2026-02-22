import { describe, it, expect } from 'vitest';
import { PlayParser, ASTNode, NodeType, astToHTML, extractStructure } from './playParser';

describe('PlayParser', () => {
  describe('parsing sections (#)', () => {
    it('should parse a single section', () => {
      const parser = new PlayParser();
      const ast = parser.parse('#Acte I');

      expect(ast.type).toBe(NodeType.ROOT);
      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.SECTION);
      expect(ast.children[0].value).toBe('Acte I');
      expect(ast.children[0].attributes.title).toBe('Acte I');
    });

    it('should parse multiple sections', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`#Acte I
#Acte II
#Acte III`);

      expect(ast.children).toHaveLength(3);
      expect(ast.children.every(node => node.type === NodeType.SECTION)).toBe(true);
      expect(ast.children[0].value).toBe('Acte I');
      expect(ast.children[1].value).toBe('Acte II');
      expect(ast.children[2].value).toBe('Acte III');
    });

    it('should handle sections with extra whitespace', () => {
      const parser = new PlayParser();
      const ast = parser.parse('#   Acte I   ');

      expect(ast.children[0].type).toBe(NodeType.SECTION);
      expect(ast.children[0].value).toBe('Acte I');
    });
  });

  describe('parsing subsections (##)', () => {
    it('should parse a single subsection', () => {
      const parser = new PlayParser();
      const ast = parser.parse('##Scène 1');

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.SUBSECTION);
      expect(ast.children[0].value).toBe('Scène 1');
      expect(ast.children[0].attributes.title).toBe('Scène 1');
    });

    it('should nest subsections inside sections', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`#Acte I
##Scène 1
##Scène 2`);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.SECTION);
      expect(ast.children[0].children).toHaveLength(2);
      expect(ast.children[0].children[0].type).toBe(NodeType.SUBSECTION);
      expect(ast.children[0].children[1].type).toBe(NodeType.SUBSECTION);
    });

    it('should handle orphan subsections (before first section)', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`##Scène 1
#Acte I
##Scène 2`);

      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].type).toBe(NodeType.SUBSECTION);
      expect(ast.children[1].type).toBe(NodeType.SECTION);
      expect(ast.children[1].children[0].type).toBe(NodeType.SUBSECTION);
    });

    it('should handle subsections with extra whitespace', () => {
      const parser = new PlayParser();
      const ast = parser.parse('##  Scène 1  ');

      expect(ast.children[0].type).toBe(NodeType.SUBSECTION);
      expect(ast.children[0].value).toBe('Scène 1');
    });
  });

  describe('parsing speech (@)', () => {
    it('should parse a character declaration', () => {
      const parser = new PlayParser();
      const ast = parser.parse('@HAMLET');

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.SPEECH);
      expect(ast.children[0].attributes.speaker).toBe('HAMLET');
    });

    it('should nest speech inside subsections', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`##Scène 1
@HAMLET
@OPHÉLIE`);

      expect(ast.children[0].type).toBe(NodeType.SUBSECTION);
      expect(ast.children[0].children).toHaveLength(2);
      expect(ast.children[0].children[0].type).toBe(NodeType.SPEECH);
      expect(ast.children[0].children[1].type).toBe(NodeType.SPEECH);
    });

    it('should handle character names with special characters', () => {
      const parser = new PlayParser();
      const ast = parser.parse('@LE ROI');

      expect(ast.children[0].attributes.speaker).toBe('LE ROI');
    });
  });

  describe('parsing stage directions', () => {
    it('should parse a standalone stage direction as opening', () => {
      const parser = new PlayParser();
      const ast = parser.parse('(Il entre)');

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.STAGE_DIRECTION);
      expect(ast.children[0].attributes.directionType).toBe('opening');
      expect(ast.children[0].value).toBe('Il entre');
    });

    it('should parse stage directions within a LINE as intra', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`@HAMLET
Être ou ne pas être (il hésite) telle est la question`);

      const speech = ast.children[0];
      expect(speech.type).toBe(NodeType.SPEECH);
      expect(speech.children).toHaveLength(1);

      const line = speech.children[0];
      expect(line.type).toBe(NodeType.LINE);
      expect(line.children).toHaveLength(3);
      expect(line.children[0].type).toBe(NodeType.TEXT_RUN);
      expect(line.children[0].value).toBe('Être ou ne pas être');
      expect(line.children[1].type).toBe(NodeType.STAGE_DIRECTION);
      expect(line.children[1].attributes.directionType).toBe('intra');
      expect(line.children[1].value).toBe('il hésite');
      expect(line.children[2].type).toBe(NodeType.TEXT_RUN);
      expect(line.children[2].value).toBe('telle est la question');
    });

    it('should handle pre + intra on the same line', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`@HAMLET
(il entre) Bonjour (il salue)`);

      const speech = ast.children[0];
      // First line: preWithText → STAGE_DIRECTION pre + LINE
      expect(speech.children).toHaveLength(2);
      expect(speech.children[0].type).toBe(NodeType.STAGE_DIRECTION);
      expect(speech.children[0].attributes.directionType).toBe('pre');
      expect(speech.children[0].value).toBe('il entre');

      const line = speech.children[1];
      expect(line.type).toBe(NodeType.LINE);
      expect(line.children).toHaveLength(2);
      expect(line.children[0].type).toBe(NodeType.TEXT_RUN);
      expect(line.children[0].value).toBe('Bonjour');
      expect(line.children[1].type).toBe(NodeType.STAGE_DIRECTION);
      expect(line.children[1].attributes.directionType).toBe('intra');
      expect(line.children[1].value).toBe('il salue');
    });

    it('should handle stage directions with special characters', () => {
      const parser = new PlayParser();
      const ast = parser.parse("(Il s'approche d'elle, lentement)");

      expect(ast.children[0].type).toBe(NodeType.STAGE_DIRECTION);
      expect(ast.children[0].value).toBe("Il s'approche d'elle, lentement");
    });
  });

  describe('parsing lines (dialogue)', () => {
    it('should parse dialogue after character as LINE with TEXT_RUN child', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`@HAMLET
Être ou ne pas être`);

      const speech = ast.children[0];
      expect(speech.children).toHaveLength(1);
      expect(speech.children[0].type).toBe(NodeType.LINE);
      expect(speech.children[0].value).toBeNull();
      expect(speech.children[0].attributes.speaker).toBe('HAMLET');
      expect(speech.children[0].children[0].type).toBe(NodeType.TEXT_RUN);
      expect(speech.children[0].children[0].value).toBe('Être ou ne pas être');
    });

    it('should parse multiple dialogue lines for same character', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`@HAMLET
Être ou ne pas être
Telle est la question`);

      const speech = ast.children[0];
      expect(speech.children).toHaveLength(2);
      expect(speech.children[0].type).toBe(NodeType.LINE);
      expect(speech.children[1].type).toBe(NodeType.LINE);
      expect(speech.children[0].attributes.speaker).toBe('HAMLET');
      expect(speech.children[1].attributes.speaker).toBe('HAMLET');
    });

    it('should handle alternating speakers', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`@HAMLET
Bonjour Ophélie
@OPHÉLIE
Bonjour mon prince`);

      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].children[0].attributes.speaker).toBe('HAMLET');
      expect(ast.children[1].children[0].attributes.speaker).toBe('OPHÉLIE');
    });
  });

  describe('stage direction types', () => {
    it('opening — stage direction before any speech in the container', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`##Scène 1
(Le salon d'une maison bourgeoise)
@JEAN
Bonjour`);

      const sub = ast.children[0];
      expect(sub.type).toBe(NodeType.SUBSECTION);
      expect(sub.children).toHaveLength(2);
      expect(sub.children[0].type).toBe(NodeType.STAGE_DIRECTION);
      expect(sub.children[0].attributes.directionType).toBe('opening');
      expect(sub.children[0].value).toBe("Le salon d'une maison bourgeoise");
      expect(sub.children[1].type).toBe(NodeType.SPEECH);
    });

    it('between — stage direction after at least one speech in the container', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`##Scène 1
@JEAN
Bonjour
(Il sort)
@MARIE
Au revoir`);

      const sub = ast.children[0];
      expect(sub.children).toHaveLength(3);
      expect(sub.children[0].type).toBe(NodeType.SPEECH);
      expect(sub.children[1].type).toBe(NodeType.STAGE_DIRECTION);
      expect(sub.children[1].attributes.directionType).toBe('between');
      expect(sub.children[1].value).toBe('Il sort');
      expect(sub.children[2].type).toBe(NodeType.SPEECH);
    });

    it('pre (alone) — whole-line stage direction as first line under a SPEECH', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`@JEAN
(souriant)
Bonjour tout le monde`);

      const speech = ast.children[0];
      expect(speech.children).toHaveLength(2);
      expect(speech.children[0].type).toBe(NodeType.STAGE_DIRECTION);
      expect(speech.children[0].attributes.directionType).toBe('pre');
      expect(speech.children[0].value).toBe('souriant');
      expect(speech.children[1].type).toBe(NodeType.LINE);
      expect(speech.children[1].children[0].type).toBe(NodeType.TEXT_RUN);
      expect(speech.children[1].children[0].value).toBe('Bonjour tout le monde');
    });

    it('pre + text — inline stage direction followed by dialogue on same line', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`@JEAN
(souriant) Bonjour tout le monde`);

      const speech = ast.children[0];
      expect(speech.children).toHaveLength(2);
      expect(speech.children[0].type).toBe(NodeType.STAGE_DIRECTION);
      expect(speech.children[0].attributes.directionType).toBe('pre');
      expect(speech.children[0].value).toBe('souriant');
      expect(speech.children[1].type).toBe(NodeType.LINE);
      expect(speech.children[1].children[0].type).toBe(NodeType.TEXT_RUN);
      expect(speech.children[1].children[0].value).toBe('Bonjour tout le monde');
    });

    it('intra — parenthesised aside embedded in a dialogue line', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`@HAMLET
Être ou ne pas être (il hésite) telle est la question`);

      const speech = ast.children[0];
      expect(speech.children).toHaveLength(1);

      const line = speech.children[0];
      expect(line.type).toBe(NodeType.LINE);
      expect(line.children).toHaveLength(3);
      expect(line.children[0].type).toBe(NodeType.TEXT_RUN);
      expect(line.children[0].value).toBe('Être ou ne pas être');
      expect(line.children[1].type).toBe(NodeType.STAGE_DIRECTION);
      expect(line.children[1].attributes.directionType).toBe('intra');
      expect(line.children[1].value).toBe('il hésite');
      expect(line.children[2].type).toBe(NodeType.TEXT_RUN);
      expect(line.children[2].value).toBe('telle est la question');
    });

    it('mixed — opening + pre + intra + between in one scene', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`##Scène 1
(Un jardin)
@JEAN
(hésitant) Bonjour (il tousse) comment vas-tu ?
(Un temps)
@MARIE
Bien merci`);

      const sub = ast.children[0];
      expect(sub.children).toHaveLength(4);

      // opening
      expect(sub.children[0].type).toBe(NodeType.STAGE_DIRECTION);
      expect(sub.children[0].attributes.directionType).toBe('opening');
      expect(sub.children[0].value).toBe('Un jardin');

      // JEAN
      const jean = sub.children[1];
      expect(jean.type).toBe(NodeType.SPEECH);
      expect(jean.attributes.speaker).toBe('JEAN');
      expect(jean.children[0].type).toBe(NodeType.STAGE_DIRECTION);
      expect(jean.children[0].attributes.directionType).toBe('pre');
      expect(jean.children[0].value).toBe('hésitant');
      const jeanLine = jean.children[1];
      expect(jeanLine.type).toBe(NodeType.LINE);
      expect(jeanLine.children[0].type).toBe(NodeType.TEXT_RUN);
      expect(jeanLine.children[0].value).toBe('Bonjour');
      expect(jeanLine.children[1].type).toBe(NodeType.STAGE_DIRECTION);
      expect(jeanLine.children[1].attributes.directionType).toBe('intra');
      expect(jeanLine.children[1].value).toBe('il tousse');
      expect(jeanLine.children[2].type).toBe(NodeType.TEXT_RUN);
      expect(jeanLine.children[2].value).toBe('comment vas-tu ?');

      // between
      expect(sub.children[2].type).toBe(NodeType.STAGE_DIRECTION);
      expect(sub.children[2].attributes.directionType).toBe('between');
      expect(sub.children[2].value).toBe('Un temps');

      // MARIE
      const marie = sub.children[3];
      expect(marie.type).toBe(NodeType.SPEECH);
      expect(marie.attributes.speaker).toBe('MARIE');
      expect(marie.children[0].type).toBe(NodeType.LINE);
      expect(marie.children[0].children[0].value).toBe('Bien merci');
    });
  });

  describe('abstract structure', () => {
    it('subsections without a parent section go directly under ROOT', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`##Scène 1
@JEAN
Bonjour
##Scène 2
@MARIE
Au revoir`);

      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].type).toBe(NodeType.SUBSECTION);
      expect(ast.children[1].type).toBe(NodeType.SUBSECTION);
    });

    it('speech without any section or subsection goes directly under ROOT', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`@JEAN
Bonjour
@MARIE
Au revoir`);

      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].type).toBe(NodeType.SPEECH);
      expect(ast.children[1].type).toBe(NodeType.SPEECH);
    });

    it('accepts custom section and subsection labels', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`# Premier Mouvement
## Tableau 1`);

      expect(ast.children[0].type).toBe(NodeType.SECTION);
      expect(ast.children[0].value).toBe('Premier Mouvement');
      expect(ast.children[0].children[0].type).toBe(NodeType.SUBSECTION);
      expect(ast.children[0].children[0].value).toBe('Tableau 1');
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

    it('should handle plain text without any tags as TEXT_RUN', () => {
      const parser = new PlayParser();
      const ast = parser.parse('This is plain text');

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe(NodeType.TEXT_RUN);
      expect(ast.children[0].value).toBe('This is plain text');
    });

    it('should ignore empty lines', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`#Acte I

##Scène 1

@HAMLET`);

      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].children).toHaveLength(1);
      expect(ast.children[0].children[0].children).toHaveLength(1);
    });

    it('should handle tags with leading/trailing spaces', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`# Acte
## Scène
@ Personnage`);

      expect(ast.children[0].type).toBe(NodeType.SECTION);
      expect(ast.children[0].children[0].type).toBe(NodeType.SUBSECTION);
      expect(ast.children[0].children[0].children[0].type).toBe(NodeType.SPEECH);
    });
  });

  describe('complex structure', () => {
    it('should parse a complete play structure', () => {
      const parser = new PlayParser();
      const ast = parser.parse(`#Acte I
##Scène 1
@HAMLET
(Il entre) Être ou ne pas être
Telle est la question
@OPHÉLIE
Mon prince
##Scène 2
@LE ROI
(à part) Que se passe-t-il ?`);

      expect(ast.type).toBe(NodeType.ROOT);
      expect(ast.children).toHaveLength(1);

      const section = ast.children[0];
      expect(section.type).toBe(NodeType.SECTION);
      expect(section.children).toHaveLength(2);

      const sub1 = section.children[0];
      expect(sub1.type).toBe(NodeType.SUBSECTION);
      expect(sub1.children).toHaveLength(2); // HAMLET, OPHÉLIE

      const sub2 = section.children[1];
      expect(sub2.type).toBe(NodeType.SUBSECTION);
      expect(sub2.children).toHaveLength(1); // LE ROI
    });
  });
});

describe('ASTNode', () => {
  it('should create a node with proper structure', () => {
    const node = new ASTNode(NodeType.SECTION, 'Acte I', { title: 'Acte I' });

    expect(node.type).toBe(NodeType.SECTION);
    expect(node.value).toBe('Acte I');
    expect(node.attributes.title).toBe('Acte I');
    expect(node.children).toEqual([]);
    expect(node.position).toEqual({ start: 0, end: 0 });
  });

  it('should add children correctly', () => {
    const parent = new ASTNode(NodeType.SECTION);
    const child = new ASTNode(NodeType.SUBSECTION);

    parent.addChild(child);

    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(child);
  });

  it('should convert to JSON correctly', () => {
    const node = new ASTNode(NodeType.SECTION, 'Acte I', { title: 'Acte I' });
    const child = new ASTNode(NodeType.SUBSECTION, 'Scène 1', { title: 'Scène 1' });
    node.addChild(child);

    const json = node.toJSON();

    expect(json.type).toBe(NodeType.SECTION);
    expect(json.value).toBe('Acte I');
    expect(json.attributes.title).toBe('Acte I');
    expect(json.children).toHaveLength(1);
    expect(json.children[0].type).toBe(NodeType.SUBSECTION);
  });
});

describe('extractStructure', () => {
  it('should extract acts and scenes', () => {
    const parser = new PlayParser();
    const ast = parser.parse(`#Acte I
##Scène 1
##Scène 2
#Acte II
##Scène 1`);

    const structure = extractStructure(ast);

    expect(structure.items).toHaveLength(2);
    expect(structure.items[0].type).toBe('acte');
    expect(structure.items[0].scenes).toHaveLength(2);
    expect(structure.items[1].type).toBe('acte');
    expect(structure.items[1].scenes).toHaveLength(1);
  });

  it('should extract orphan scenes', () => {
    const parser = new PlayParser();
    const ast = parser.parse(`##Scène Prologue
#Acte I
##Scène 1`);

    const structure = extractStructure(ast);

    expect(structure.orphanScenes).toHaveLength(1);
    expect(structure.orphanScenes[0].value).toBe('Scène Prologue');
  });

  it('should extract character names', () => {
    const parser = new PlayParser();
    const ast = parser.parse(`@HAMLET
Être ou ne pas être
@OPHÉLIE
Mon prince
@HAMLET
Telle est la question`);

    const structure = extractStructure(ast);

    expect(structure.personnages).toContain('HAMLET');
    expect(structure.personnages).toContain('OPHÉLIE');
    expect(structure.personnages).toHaveLength(2);
  });

  it('should extract character from SPEECH attributes', () => {
    const parser = new PlayParser();
    const ast = parser.parse(`@LE ROI
(au garde) Allez chercher Hamlet`);

    const structure = extractStructure(ast);

    expect(structure.personnages).toContain('LE ROI');
  });

  it('should return { items, orphanScenes, personnages } with stable output types', () => {
    const parser = new PlayParser();
    const ast = parser.parse(`#Acte I
##Scène 1
@HAMLET
Bonjour`);

    const structure = extractStructure(ast);

    // items[] objects use label 'acte', scenes[] objects use label 'scene'
    expect(structure.items[0].type).toBe('acte');
    expect(structure.items[0].scenes[0].type).toBe('scene');
    expect(Array.isArray(structure.personnages)).toBe(true);
    expect(structure.personnages).toContain('HAMLET');
  });

  it('should handle empty AST', () => {
    const parser = new PlayParser();
    const structure = extractStructure(parser.parse(''));

    expect(structure.items).toHaveLength(0);
    expect(structure.orphanScenes).toHaveLength(0);
    expect(structure.personnages).toHaveLength(0);
  });
});

describe('astToHTML output', () => {
  it('should render all node types with correct CSS classes and data attributes', () => {
    const parser = new PlayParser();
    const ast = parser.parse(`##Scène 1
(Un salon)
@JEAN
(doucement) Bonjour (il sourit) monde`);

    const html = astToHTML(ast);

    // Container and heading classes
    expect(html).toContain('class="scene-container"');
    expect(html).toContain('class="scene"');

    // Opening stage direction
    expect(html).toContain('class="didascalie" data-type="opening"');

    // Speech container and heading
    expect(html).toContain('class="personnage-container"');
    expect(html).toContain('class="personnage"');

    // Pre stage direction (block)
    expect(html).toContain('class="didascalie" data-type="pre"');

    // Dialogue line
    expect(html).toContain('class="dialogue"');

    // Intra stage direction (inline span)
    expect(html).toContain('class="didascalie" data-type="intra"');

    // Stage direction values have no surrounding parentheses
    expect(html).toContain('>Un salon<');
    expect(html).toContain('>doucement<');
    expect(html).toContain('>il sourit<');
    expect(html).not.toMatch(/>\s*\(/);
    expect(html).not.toMatch(/\)\s*</);
  });
});
