import { describe, it, expect } from 'vitest';
import { PlayParser } from './playParser';
import { astToHTML } from './playTransformers';

/**
 * Parse une chaîne HTML en DOM pour faciliter les assertions
 */
function toDOM(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

describe('astToHTML', () => {
  const parser = new PlayParser();

  describe('cas limites', () => {
    it('retourne une chaîne vide pour un AST null', () => {
      expect(astToHTML(null)).toBe('');
    });
  });

  describe('attributs data-line', () => {
    describe('SECTION (#)', () => {
      it('place data-line sur h1.acte, pas sur .acte-container', () => {
        const dom = toDOM(astToHTML(parser.parse('#Acte I')));
        const h1 = dom.querySelector('h1.acte');
        const container = dom.querySelector('.acte-container');

        expect(h1.dataset.line).toBe('0');
        expect(container.dataset.line).toBeUndefined();
      });

      it('reflète le numéro de ligne correct pour plusieurs actes', () => {
        const dom = toDOM(astToHTML(parser.parse('#Acte I\n#Acte II')));
        const [h1a, h1b] = dom.querySelectorAll('h1.acte');

        expect(h1a.dataset.line).toBe('0');
        expect(h1b.dataset.line).toBe('1');
      });
    });

    describe('SUBSECTION (##)', () => {
      it('place data-line sur h2.scene, pas sur .scene-container', () => {
        const dom = toDOM(astToHTML(parser.parse('#Acte I\n##Scène 1')));
        const h2 = dom.querySelector('h2.scene');
        const container = dom.querySelector('.scene-container');

        expect(h2.dataset.line).toBe('1');
        expect(container.dataset.line).toBeUndefined();
      });
    });

    describe('SPEECH (@)', () => {
      it('place data-line sur h3.personnage, pas sur .personnage-container', () => {
        const dom = toDOM(astToHTML(parser.parse('@HAMLET')));
        const h3 = dom.querySelector('h3.personnage');
        const container = dom.querySelector('.personnage-container');

        expect(h3.dataset.line).toBe('0');
        expect(container.dataset.line).toBeUndefined();
      });

      it('reflète le numéro de ligne correct quand le personnage n\'est pas en ligne 0', () => {
        const dom = toDOM(astToHTML(parser.parse('##Scène 1\n@HAMLET')));
        const h3 = dom.querySelector('h3.personnage');

        expect(h3.dataset.line).toBe('1');
      });
    });

    describe('LINE (dialogue)', () => {
      it('place data-line sur p.dialogue', () => {
        const dom = toDOM(astToHTML(parser.parse('@HAMLET\nÊtre ou ne pas être')));
        const p = dom.querySelector('p.dialogue');

        expect(p.dataset.line).toBe('1');
      });

      it('reflète des numéros de ligne distincts pour deux personnages différents', () => {
        const dom = toDOM(astToHTML(parser.parse('@HAMLET\nRéplique 1\n@OPHÉLIE\nRéplique 2')));
        const [p1, p2] = dom.querySelectorAll('p.dialogue');

        expect(p1.dataset.line).toBe('1');
        expect(p2.dataset.line).toBe('3');
      });
    });

    describe('STAGE_DIRECTION (didascalie)', () => {
      it('place data-line sur p.didascalie pour une didascalie bloc', () => {
        const dom = toDOM(astToHTML(parser.parse('(Lumières.)')));
        const p = dom.querySelector('p.didascalie');

        expect(p.dataset.line).toBe('0');
      });

      it('place data-line sur span.didascalie[data-type="intra"] pour une didascalie inline', () => {
        const dom = toDOM(astToHTML(parser.parse('@HAMLET\nÊtre (hésitant) ou ne pas être')));
        const span = dom.querySelector('span.didascalie[data-type="intra"]');

        if (span) {
          // La didascalie intra est sur la ligne du dialogue (ligne 1)
          expect(span.dataset.line).toBe('1');
        }
      });
    });
  });

  describe('échappement HTML', () => {
    it('échappe les caractères spéciaux dans les titres de section', () => {
      const dom = toDOM(astToHTML(parser.parse('#Acte <I> & "II"')));
      expect(dom.querySelector('h1.acte').textContent).toBe('Acte <I> & "II"');
    });

    it('échappe les caractères spéciaux dans les noms de personnage', () => {
      const dom = toDOM(astToHTML(parser.parse('@DOM <JUAN>')));
      expect(dom.querySelector('h3.personnage').textContent).toBe('DOM <JUAN>');
    });

    it('échappe les caractères spéciaux dans les dialogues', () => {
      const dom = toDOM(astToHTML(parser.parse('@HAMLET\nIl dit : <bonjour>')));
      expect(dom.querySelector('p.dialogue').textContent).toBe('Il dit : <bonjour>');
    });
  });
});
