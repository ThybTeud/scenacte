/**
 * Test de l'AST hiérarchique
 */

// Import du parser (note: nécessite Node.js avec support ES modules)
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

console.log('=== TEST AST HIÉRARCHIQUE ===\n');
console.log('Input:');
console.log(testInput);
console.log('\n=== PARSING ===\n');

const parser = new PlayParser();
const ast = parser.parse(testInput);

// Affichage de l'AST en JSON avec indentation
console.log('AST généré:');
console.log(JSON.stringify(ast.toJSON(), null, 2));

console.log('\n=== VÉRIFICATION DE LA HIÉRARCHIE ===\n');

// Vérifications
const root = ast;
console.log(`Root: ${root.type} (${root.children.length} enfants)`);

if (root.children.length === 1 && root.children[0].type === 'acte') {
  console.log('✓ Acte 1 est enfant direct de root');

  const acte1 = root.children[0];
  console.log(`  Acte 1: ${acte1.value} (${acte1.children.length} enfants)`);

  if (acte1.children.length === 2) {
    console.log('✓ Acte 1 a 2 scènes');

    const scene1 = acte1.children[0];
    const scene2 = acte1.children[1];

    console.log(`    Scène 1: ${scene1.value} (${scene1.children.length} enfants)`);
    if (scene1.children.length === 2) {
      console.log('✓ Scène 1 a 2 personnages');

      const ben1 = scene1.children[0];
      const pp = scene1.children[1];

      console.log(`      BEN: ${ben1.attributes.name} (${ben1.children.length} enfants)`);
      if (ben1.children.length === 2) {
        console.log('✓ BEN a 2 enfants (dialogue + didascalie)');
        console.log(`        - ${ben1.children[0].type}: "${ben1.children[0].value}"`);
        console.log(`        - ${ben1.children[1].type}: "${ben1.children[1].value}"`);
      } else {
        console.log(`✗ ERREUR: BEN devrait avoir 2 enfants, a ${ben1.children.length}`);
      }

      console.log(`      PP: ${pp.attributes.name} (${pp.children.length} enfants)`);
      if (pp.children.length === 1) {
        console.log('✓ PP a 1 enfant (dialogue)');
        console.log(`        - ${pp.children[0].type}: "${pp.children[0].value}"`);
      } else {
        console.log(`✗ ERREUR: PP devrait avoir 1 enfant, a ${pp.children.length}`);
      }
    } else {
      console.log(`✗ ERREUR: Scène 1 devrait avoir 2 enfants, a ${scene1.children.length}`);
    }

    console.log(`    Scène 2: ${scene2.value} (${scene2.children.length} enfants)`);
    if (scene2.children.length === 1) {
      console.log('✓ Scène 2 a 1 personnage');

      const ben2 = scene2.children[0];
      console.log(`      BEN: ${ben2.attributes.name} (${ben2.children.length} enfants)`);
      if (ben2.children.length === 1) {
        console.log('✓ BEN a 1 enfant (dialogue)');
        console.log(`        - ${ben2.children[0].type}: "${ben2.children[0].value}"`);
      } else {
        console.log(`✗ ERREUR: BEN devrait avoir 1 enfant, a ${ben2.children.length}`);
      }
    } else {
      console.log(`✗ ERREUR: Scène 2 devrait avoir 1 enfant, a ${scene2.children.length}`);
    }
  } else {
    console.log(`✗ ERREUR: Acte 1 devrait avoir 2 enfants, a ${acte1.children.length}`);
  }
} else {
  console.log(`✗ ERREUR: Root devrait avoir 1 enfant de type acte, a ${root.children.length} enfants`);
}

console.log('\n=== TEST TERMINÉ ===');
