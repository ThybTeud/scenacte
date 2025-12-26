/**
 * Affichage visuel de l'arbre AST
 */

import { PlayParser } from './client/src/utils/playParser.js';

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

const parser = new PlayParser();
const ast = parser.parse(testInput);

console.log('=== ARBRE AST HIÉRARCHIQUE ===\n');

function displayTree(node, prefix = '', isLast = true) {
  const connector = isLast ? '└── ' : '├── ';
  const extension = isLast ? '    ' : '│   ';

  let label = node.type;
  if (node.value) {
    label += `: "${node.value}"`;
  } else if (node.attributes && node.attributes.name) {
    label += `: ${node.attributes.name}`;
  } else if (node.attributes && node.attributes.number) {
    label += `: ${node.attributes.number}`;
  }

  console.log(prefix + connector + label);

  if (node.children && node.children.length > 0) {
    node.children.forEach((child, index) => {
      const isLastChild = index === node.children.length - 1;
      displayTree(child, prefix + extension, isLastChild);
    });
  }
}

displayTree(ast);

console.log('\n=== LÉGENDE ===');
console.log('root         - Racine de l\'AST');
console.log('acte         - Acte de la pièce (#)');
console.log('scene        - Scène de l\'acte (##)');
console.log('personnage   - Personnage (@)');
console.log('dialogue     - Réplique du personnage');
console.log('didascalie   - Indication scénique (parenthèses)');
