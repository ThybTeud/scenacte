/**
 * Test du rendu HTML avec l'AST hiérarchique
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

console.log('=== TEST RENDU HTML ===\n');

const parser = new PlayParser();
const ast = parser.parse(testInput);

// Note: astToHTML nécessite document.createElement pour escapeHTML
// Créons un mock basique pour les tests Node.js
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

const html = astToHTML(ast);

console.log('HTML généré:');
console.log(html);

console.log('\n=== VÉRIFICATIONS ===\n');

// Vérifier la structure hiérarchique dans le HTML
if (html.includes('class="play-root"')) {
  console.log('✓ Container root présent');
}

if (html.includes('class="acte-container"')) {
  console.log('✓ Container acte présent');
}

if (html.includes('class="scene-container"')) {
  console.log('✓ Containers scène présents');
}

if (html.includes('class="personnage-container"')) {
  console.log('✓ Containers personnage présents');
}

if (html.includes('class="dialogue"') && html.includes('Coucou !')) {
  console.log('✓ Dialogue BEN rendu');
}

if (html.includes('class="didascalie"') && html.includes('il sourit')) {
  console.log('✓ Didascalie rendue');
}

if (html.includes('class="dialogue"') && html.includes('Bonjour.')) {
  console.log('✓ Dialogue PP rendu');
}

console.log('\n=== TEST TERMINÉ ===');
