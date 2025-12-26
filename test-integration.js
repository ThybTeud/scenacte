/**
 * Test d'intégration avec les autres modules
 */

import { PlayParser, extractStructure } from './client/src/utils/playParser.js';
import { calculatePlayStatistics } from './client/src/utils/playStatistics.js';

console.log('=== TEST D\'INTÉGRATION ===\n');

const testPlay = `#Acte 1
##Scène 1
@HAMLET
Être ou ne pas être, c'est là la question.
(il hésite)
Qu'il est plus noble à l'âme de souffrir
La fronde et les flèches de la fortune outrageante.

@OPHÉLIE
Monseigneur, j'ai de vous des souvenirs
Que depuis longtemps je désire vous rendre.

##Scène 2
@HAMLET
Adieu, douce Ophélie.
(il sort)

#Acte 2
##Scène 1
@LE ROI
Il y a quelque chose dans son âme.
@LA REINE
Je le crois aussi.`;

const parser = new PlayParser();

console.log('--- Test 1: Parsing et structure ---');
const ast = parser.parse(testPlay);
const structure = extractStructure(ast);

console.log('Actes trouvés:', structure.actes.length);
console.log('Détails:', structure.actes);

console.log('\nScènes trouvées:', structure.scenes.length);
console.log('Détails:', structure.scenes);

console.log('\nPersonnages trouvés:', structure.personnages.length);
console.log('Liste:', structure.personnages);

console.log('\n--- Test 2: Statistiques ---');
const stats = calculatePlayStatistics(testPlay);

console.log('Statistiques calculées:');
console.log('  - Actes:', stats.totalActs);
console.log('  - Scènes:', stats.totalScenes);
console.log('  - Personnages:', stats.totalCharacters);
console.log('  - Lignes de dialogue:', stats.totalLines);
console.log('  - Nombre de mots:', stats.wordCount);
console.log('  - Durée estimée:', stats.estimatedDurationMinutes, 'minutes');

console.log('\n--- Test 3: Vérification de la cohérence ---');

// Vérifier que les statistiques correspondent à la structure
if (stats.totalActs === structure.actes.length) {
  console.log('✓ Nombre d\'actes cohérent');
} else {
  console.log('✗ ERREUR: Incohérence actes -', stats.totalActs, 'vs', structure.actes.length);
}

if (stats.totalScenes === structure.scenes.length) {
  console.log('✓ Nombre de scènes cohérent');
} else {
  console.log('✗ ERREUR: Incohérence scènes -', stats.totalScenes, 'vs', structure.scenes.length);
}

if (stats.totalCharacters === structure.personnages.length) {
  console.log('✓ Nombre de personnages cohérent');
} else {
  console.log('✗ ERREUR: Incohérence personnages -', stats.totalCharacters, 'vs', structure.personnages.length);
}

console.log('\n--- Test 4: Vérification de la hiérarchie dans l\'AST ---');

// Vérifier que les scènes sont bien enfants des actes
const acte1 = ast.children[0];
const acte2 = ast.children[1];

if (acte1 && acte1.type === 'acte' && acte1.children.length === 2) {
  console.log('✓ Acte 1 contient 2 scènes (enfants directs)');
} else {
  console.log('✗ ERREUR: Structure hiérarchique incorrecte pour Acte 1');
}

if (acte2 && acte2.type === 'acte' && acte2.children.length === 1) {
  console.log('✓ Acte 2 contient 1 scène (enfant direct)');
} else {
  console.log('✗ ERREUR: Structure hiérarchique incorrecte pour Acte 2');
}

// Vérifier que les personnages sont bien enfants des scènes
const scene1 = acte1.children[0];
if (scene1 && scene1.type === 'scene' && scene1.children.length === 2) {
  console.log('✓ Scène 1 contient 2 personnages (enfants directs)');

  const hamlet = scene1.children[0];
  const ophelie = scene1.children[1];

  if (hamlet.attributes.name === 'HAMLET' && hamlet.children.length === 4) {
    console.log('✓ HAMLET a 4 enfants (3 dialogues + 1 didascalie)');
  } else {
    console.log('✗ ERREUR: Structure incorrecte pour HAMLET - attendu 4, obtenu', hamlet.children.length);
  }

  if (ophelie.attributes.name === 'OPHÉLIE' && ophelie.children.length === 2) {
    console.log('✓ OPHÉLIE a 2 enfants (dialogues)');
  } else {
    console.log('✗ ERREUR: Structure incorrecte pour OPHÉLIE');
  }
} else {
  console.log('✗ ERREUR: Structure hiérarchique incorrecte pour Scène 1');
}

console.log('\n--- Test 5: Performance ---');

const longPlay = testPlay.repeat(100); // Répéter le texte 100 fois
const startTime = Date.now();
const longAst = parser.parse(longPlay);
const parseTime = Date.now() - startTime;

console.log(`Parsing d'un texte de ${longPlay.length} caractères: ${parseTime}ms`);

const startStatsTime = Date.now();
const longStats = calculatePlayStatistics(longPlay);
const statsTime = Date.now() - startStatsTime;

console.log(`Calcul des statistiques: ${statsTime}ms`);
console.log(`  - ${longStats.totalActs} actes`);
console.log(`  - ${longStats.totalScenes} scènes`);
console.log(`  - ${longStats.totalCharacters} personnages`);

if (parseTime < 1000 && statsTime < 1000) {
  console.log('✓ Performance acceptable (<1s)');
} else {
  console.log('⚠ Performance à optimiser (>1s)');
}

console.log('\n=== TOUS LES TESTS D\'INTÉGRATION TERMINÉS ===');
