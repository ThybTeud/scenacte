/**
 * Debug HAMLET structure
 */

import { PlayParser } from './client/src/utils/playParser.js';

const testPlay = `#Acte 1
##Scène 1
@HAMLET
Être ou ne pas être, c'est là la question.
(il hésite)
Qu'il est plus noble à l'âme de souffrir
La fronde et les flèches de la fortune outrageante.`;

const parser = new PlayParser();
const ast = parser.parse(testPlay);

const hamlet = ast.children[0].children[0].children[0];

console.log('HAMLET attributes:', hamlet.attributes);
console.log('HAMLET children count:', hamlet.children.length);
console.log('\nEnfants de HAMLET:');
hamlet.children.forEach((child, i) => {
  console.log(`  ${i + 1}. ${child.type}: "${child.value}"`);
});
