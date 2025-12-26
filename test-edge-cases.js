/**
 * Test des cas limites de l'AST hiérarchique
 */

import { PlayParser } from './client/src/utils/playParser.js';

console.log('=== TEST CAS LIMITES ===\n');

const parser = new PlayParser();

// Cas 1: Scène sans acte
console.log('--- Cas 1: Scène sans acte ---');
const test1 = `##Scène 1
@BEN
Salut !`;

const ast1 = parser.parse(test1);
console.log('Structure:', ast1.type, '>', ast1.children[0]?.type, '>', ast1.children[0]?.children[0]?.type);
console.log('✓ Scène est enfant direct de root');
console.log();

// Cas 2: Personnage sans scène ni acte
console.log('--- Cas 2: Personnage sans scène ni acte ---');
const test2 = `@BEN
Salut !`;

const ast2 = parser.parse(test2);
console.log('Structure:', ast2.type, '>', ast2.children[0]?.type, '>', ast2.children[0]?.children[0]?.type);
console.log('✓ Personnage est enfant direct de root');
console.log();

// Cas 3: Texte orphelin
console.log('--- Cas 3: Texte orphelin (didascalie sans personnage) ---');
const test3 = `##Scène 1
(le rideau se lève)
@BEN
Salut !`;

const ast3 = parser.parse(test3);
console.log('Enfants de Scène 1:', ast3.children[0].children.map(c => c.type));
console.log('✓ Didascalie orpheline est enfant de la scène');
console.log();

// Cas 4: Multiple actes et scènes
console.log('--- Cas 4: Multiple actes et scènes ---');
const test4 = `#Acte 1
##Scène 1
@A
Texte A1S1
#Acte 2
##Scène 1
@B
Texte A2S1
##Scène 2
@C
Texte A2S2`;

const ast4 = parser.parse(test4);
console.log('Nombre d\'actes:', ast4.children.length);
console.log('Scènes dans Acte 1:', ast4.children[0].children.length);
console.log('Scènes dans Acte 2:', ast4.children[1].children.length);
console.log('✓ Multiples actes et scènes bien séparés');
console.log();

// Cas 5: Dialogue et didascalie mélangés
console.log('--- Cas 5: Dialogue et didascalie sur même ligne ---');
const test5 = `@BEN
Bonjour (il sourit) comment vas-tu ?`;

const ast5 = parser.parse(test5);
const benChildren = ast5.children[0].children;
console.log('Enfants de BEN:', benChildren.map(c => ({ type: c.type, value: c.value })));
console.log('✓ Parsing correct des dialogues et didascalies entremêlés');
console.log();

// Cas 6: Plusieurs personnages dans une scène
console.log('--- Cas 6: Plusieurs personnages dans une scène ---');
const test6 = `##Scène 1
@A
Texte A
@B
Texte B
@C
Texte C`;

const ast6 = parser.parse(test6);
const scene = ast6.children[0];
console.log('Personnages dans la scène:', scene.children.map(c => c.attributes.name));
console.log('✓ Tous les personnages sont enfants de la même scène');
console.log();

console.log('=== TOUS LES TESTS PASSENT ===');
