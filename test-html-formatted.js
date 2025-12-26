/**
 * Test du rendu HTML formaté avec l'AST hiérarchique
 */

import { PlayParser, astToHTML } from './client/src/utils/playParser.js';

const testInput = `#Acte 1
##Scène 1
@BEN
Coucou !
(il sourit)
@PP
Bonjour.
##Scène 2
@BEN
Fin.`;

// Mock pour document
global.document = {
  createElement: (tag) => ({
    textContent: '',
    get innerHTML() {
      return this.textContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
    set textContent(value) {
      this._text = value;
      Object.defineProperty(this, 'textContent', {
        get: () => this._text,
        set: (v) => { this._text = v; }
      });
    }
  })
};

const parser = new PlayParser();
const ast = parser.parse(testInput);
const html = astToHTML(ast);

// Fonction simple pour formater le HTML (indentation)
function formatHTML(html) {
  let formatted = '';
  let indent = 0;
  const tokens = html.split(/(<[^>]+>)/g).filter(t => t.trim());

  tokens.forEach(token => {
    if (token.startsWith('</')) {
      indent--;
      formatted += '  '.repeat(Math.max(0, indent)) + token + '\n';
    } else if (token.startsWith('<') && !token.endsWith('/>') && !token.startsWith('<!')) {
      formatted += '  '.repeat(indent) + token + '\n';
      if (!token.includes('</')) {
        indent++;
      }
    } else {
      formatted += '  '.repeat(indent) + token + '\n';
    }
  });

  return formatted;
}

console.log('=== HTML FORMATÉ ===\n');
console.log(formatHTML(html));
