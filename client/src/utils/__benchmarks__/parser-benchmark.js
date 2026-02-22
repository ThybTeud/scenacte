/**
 * Benchmark de performance pour PlayParser
 *
 * Texte de test : ~500 lignes
 *   - 5 actes × 3 scènes × 4 personnages × 4 lignes de dialogue
 *   - 4 types de didascalies :
 *       1. Liminaires       – après un acte ou une scène (ligne autonome)
 *       2. Inter-répliques  – entre deux prises de parole (ligne autonome)
 *       3. Pré-répliques    – en début de ligne avant le dialogue
 *       4. Intra-répliques  – intercalées dans le dialogue
 *
 * Mesure : 1000 itérations, performance.now() ; affiche moyenne et P95.
 */

import { PlayParser } from '../playParser.js';
import { performance } from 'node:perf_hooks';

// ---------------------------------------------------------------------------
// Génération du texte de test (~500 lignes)
// ---------------------------------------------------------------------------

function generateTestText() {
  const personnages = ['ALCESTE', 'PHILINTE', 'CÉLIMÈNE', 'ARSINOÉ'];
  const lines = [];

  for (let a = 1; a <= 5; a++) {
    // Marqueur d'acte
    lines.push(`#Acte ${a}`);
    // Type 1 – didascalie liminaire après acte
    lines.push(`(L'action se déroule dans un salon bourgeois. Acte ${a}. Les bougies sont allumées.)`);
    lines.push('');

    for (let s = 1; s <= 3; s++) {
      // Marqueur de scène
      lines.push(`##Scène ${s}`);
      // Type 1 – didascalie liminaire après scène
      lines.push(`(Les personnages font leur entrée. Scène ${s} de l'acte ${a}. La lumière change.)`);
      lines.push('');

      for (let p = 0; p < personnages.length; p++) {
        const nom = personnages[p];
        const suivant = personnages[(p + 1) % personnages.length];

        // Marqueur de personnage
        lines.push(`@${nom}`);

        // Dialogue 1 – Type 3 : pré-réplique en début de ligne
        lines.push(
          `(À part, d'un ton résolu) Je ne saurais souffrir une âme aussi complaisante, ` +
          `et c'est là le fond de mon caractère à l'acte ${a}.`
        );

        // Dialogue 2 – Type 4 : intra-réplique dans le dialogue
        lines.push(
          `Vous me direz (avec une ironie à peine voilée) ce que vous voudrez, ` +
          `mais je maintiens que la sincérité est la première des vertus.`
        );

        // Dialogue 3 – réplique ordinaire
        lines.push(
          `L'hypocrisie est un hommage que le vice rend à la vertu, ` +
          `et je ne suis pas homme à lui rendre cet hommage-là.`
        );

        // Dialogue 4 – réplique ordinaire (ligne supplémentaire pour atteindre ~500 lignes)
        lines.push(
          `Songez-y bien, ${suivant} : le monde va tout de travers, ` +
          `et j'enrage de voir les hommes vivre comme ils font.`
        );

        // Type 2 – inter-réplique entre personnages (sauf après le dernier)
        if (p < personnages.length - 1) {
          lines.push('');
          lines.push(
            `(Un silence pesant s'installe. ${suivant} s'avance vers le centre de la scène, ` +
            `visiblement troublé par ce qui vient d'être dit.)`
          );
          lines.push('');
        }
      }

      lines.push('');
    }

    lines.push('');
  }

  return lines.join('\n');
}

const TEXT = generateTestText();
const lineCount = TEXT.split('\n').length;

// ---------------------------------------------------------------------------
// Benchmark
// ---------------------------------------------------------------------------

const parser = new PlayParser();
const N = 1000;
const timings = new Array(N);

// Chauffe : 10 itérations non mesurées pour stabiliser le moteur JS
for (let i = 0; i < 10; i++) {
  parser.parse(TEXT);
}

// Mesures
for (let i = 0; i < N; i++) {
  const t0 = performance.now();
  parser.parse(TEXT);
  timings[i] = performance.now() - t0;
}

// Statistiques
const avg = timings.reduce((s, v) => s + v, 0) / N;
const sorted = timings.slice().sort((a, b) => a - b);
const p95 = sorted[Math.ceil(N * 0.95) - 1];

console.log(`Texte de test  : ${lineCount} lignes`);
console.log(`Itérations     : ${N}`);
console.log('');
console.log(`Moyenne        : ${avg.toFixed(3)} ms`);
console.log(`P95            : ${p95.toFixed(3)} ms`);
