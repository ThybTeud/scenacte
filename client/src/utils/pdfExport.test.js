import { describe, it, expect, vi } from 'vitest';
import { generatePdfHtml } from './pdfExport';
import { DEFAULT_PRESETS, DEFAULT_PRESET_ID } from '../config/template-presets';

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

/** Extrait la valeur de `size:` dans la règle @page { … } du bloc preset-overrides */
function extractPageSize(html) {
  const presetBlock = html.match(/<style id="preset-overrides">([\s\S]*?)<\/style>/)?.[1];
  if (!presetBlock) return null;
  // Match @page { ... size: XYZ; ... } — the first @page block (not :left/:right)
  const pageRule = presetBlock.match(/@page\s*\{([^}]+)\}/);
  if (!pageRule) return null;
  const sizeMatch = pageRule[1].match(/size:\s*([^;]+);/);
  return sizeMatch ? sizeMatch[1].trim() : null;
}

/** Extrait les marges du bloc @page principal dans preset-overrides */
function extractPageMargins(html) {
  const presetBlock = html.match(/<style id="preset-overrides">([\s\S]*?)<\/style>/)?.[1];
  if (!presetBlock) return null;
  const pageRule = presetBlock.match(/@page\s*\{([^}]+)\}/);
  if (!pageRule) return null;
  const top = pageRule[1].match(/margin-top:\s*([^;]+);/)?.[1]?.trim();
  const bottom = pageRule[1].match(/margin-bottom:\s*([^;]+);/)?.[1]?.trim();
  return { top, bottom };
}

/** Extrait les marges gauche/droite des @page :left et @page :right */
function extractSideMargins(html) {
  const presetBlock = html.match(/<style id="preset-overrides">([\s\S]*?)<\/style>/)?.[1];
  if (!presetBlock) return null;
  const leftRule = presetBlock.match(/@page\s*:left\s*\{([^}]+)\}/);
  const rightRule = presetBlock.match(/@page\s*:right\s*\{([^}]+)\}/);
  return {
    left: {
      marginLeft: leftRule?.[1]?.match(/margin-left:\s*([^;]+);/)?.[1]?.trim(),
      marginRight: leftRule?.[1]?.match(/margin-right:\s*([^;]+);/)?.[1]?.trim(),
    },
    right: {
      marginLeft: rightRule?.[1]?.match(/margin-left:\s*([^;]+);/)?.[1]?.trim(),
      marginRight: rightRule?.[1]?.match(/margin-right:\s*([^;]+);/)?.[1]?.trim(),
    },
  };
}

/** Extrait les variables CSS du :root dans preset-overrides */
function extractCSSVariables(html) {
  const presetBlock = html.match(/<style id="preset-overrides">([\s\S]*?)<\/style>/)?.[1];
  if (!presetBlock) return {};
  const rootBlock = presetBlock.match(/:root\s*\{([^}]+)\}/)?.[1];
  if (!rootBlock) return {};
  const vars = {};
  for (const line of rootBlock.split('\n')) {
    const match = line.match(/\s*(--[\w-]+):\s*(.+);/);
    if (match) vars[match[1]] = match[2].trim();
  }
  return vars;
}

const minimalArgs = {
  htmlContent: '<div class="piece" data-layout="centered"><p>Test</p></div>',
  playTitle: 'Ma Pièce',
};

// ─────────────────────────────────────────────────────
// 1. CAS NOMINAUX — Chaque preset produit les bonnes dimensions
// ─────────────────────────────────────────────────────

describe('generatePdfHtml — Dimensions de page', () => {

  describe.each(Object.entries(DEFAULT_PRESETS))('preset « %s »', (id, preset) => {
    const html = generatePdfHtml({ ...minimalArgs, presetId: id });

    it('injecte les bonnes dimensions dans @page { size }', () => {
      const size = extractPageSize(html);
      expect(size).toBe(
        `${preset.variables['--page-width']} ${preset.variables['--page-height']}`
      );
    });

    it('injecte les bonnes marges top/bottom dans @page', () => {
      const margins = extractPageMargins(html);
      expect(margins.top).toBe(preset.variables['--margin-top']);
      expect(margins.bottom).toBe(preset.variables['--margin-bottom']);
    });

    it('injecte les marges inside/outside dans @page :left et :right', () => {
      const side = extractSideMargins(html);
      // @page :left → margin-left = outside, margin-right = inside
      expect(side.left.marginLeft).toBe(preset.variables['--margin-outside']);
      expect(side.left.marginRight).toBe(preset.variables['--margin-inside']);
      // @page :right → margin-left = inside, margin-right = outside
      expect(side.right.marginLeft).toBe(preset.variables['--margin-inside']);
      expect(side.right.marginRight).toBe(preset.variables['--margin-outside']);
    });

    it('produit les bonnes variables CSS dans :root', () => {
      const vars = extractCSSVariables(html);
      expect(vars['--page-width']).toBe(preset.variables['--page-width']);
      expect(vars['--page-height']).toBe(preset.variables['--page-height']);
      expect(vars['--font-body']).toBe(preset.variables['--font-body']);
      expect(vars['--font-size-body']).toBe(preset.variables['--font-size-body']);
      expect(vars['--line-height']).toBe(preset.variables['--line-height']);
    });
  });

  it('les 3 presets ont des dimensions distinctes ou identifiables', () => {
    const sizes = Object.entries(DEFAULT_PRESETS).map(([id, p]) =>
      `${p.variables['--page-width']}x${p.variables['--page-height']}`
    );
    // actes-sud = 110x180, editions-theatrales = 140x210, arche = 148x210
    expect(sizes).toContain('110mm×180mm'.replace('×', 'x'));
    expect(sizes).toContain('140mm×210mm'.replace('×', 'x'));
    expect(sizes).toContain('148mm×210mm'.replace('×', 'x'));
  });
});

// ─────────────────────────────────────────────────────
// 2. COHÉRENCE @page vs :root — Les valeurs ne doivent PAS être var()
// ─────────────────────────────────────────────────────

describe('generatePdfHtml — Pas de var() non résolues dans @page', () => {
  Object.entries(DEFAULT_PRESETS).forEach(([id]) => {
    it(`preset "${id}" : aucun var() dans les règles @page du preset-overrides`, () => {
      const html = generatePdfHtml({ ...minimalArgs, presetId: id });
      const presetBlock = html.match(/<style id="preset-overrides">([\s\S]*?)<\/style>/)?.[1] || '';
      // Chercher les @page rules dans le bloc preset
      const pageRules = presetBlock.match(/@page[^{]*\{[^}]+\}/g) || [];
      for (const rule of pageRules) {
        expect(rule).not.toContain('var(');
      }
    });
  });
});

// ─────────────────────────────────────────────────────
// 3. FALLBACK — presetId inconnu → preset par défaut (arche)
// ─────────────────────────────────────────────────────

describe('generatePdfHtml — Fallback preset', () => {
  it('utilise le preset par défaut quand presetId est inconnu', () => {
    const html = generatePdfHtml({ ...minimalArgs, presetId: 'inconnu-xyz' });
    const size = extractPageSize(html);
    const defaultPreset = DEFAULT_PRESETS[DEFAULT_PRESET_ID];
    expect(size).toBe(
      `${defaultPreset.variables['--page-width']} ${defaultPreset.variables['--page-height']}`
    );
  });

  it('utilise le preset par défaut quand presetId est undefined', () => {
    const html = generatePdfHtml({ htmlContent: '<p>x</p>', playTitle: 'T' });
    const size = extractPageSize(html);
    const defaultPreset = DEFAULT_PRESETS[DEFAULT_PRESET_ID];
    expect(size).toBe(
      `${defaultPreset.variables['--page-width']} ${defaultPreset.variables['--page-height']}`
    );
  });
});

// ─────────────────────────────────────────────────────
// 4. CUSTOM PRESET — surcharge le presetId
// ─────────────────────────────────────────────────────

describe('generatePdfHtml — Custom preset', () => {
  const customPreset = {
    name: 'Mon format',
    layout: 'marginal',
    variables: {
      '--page-width': '200mm',
      '--page-height': '300mm',
      '--margin-top': '30mm',
      '--margin-bottom': '35mm',
      '--margin-inside': '25mm',
      '--margin-outside': '20mm',
      '--font-body': "'Inter', sans-serif",
      '--font-personnage': "'Space Grotesk', sans-serif",
      '--font-size-body': '12pt',
      '--line-height': '1.6',
    },
  };

  it('utilise les dimensions du custom preset, pas celles du presetId', () => {
    const html = generatePdfHtml({
      ...minimalArgs,
      presetId: 'arche',
      customPreset,
    });
    const size = extractPageSize(html);
    expect(size).toBe('200mm 300mm');
  });

  it('génère les imports Google Fonts pour les 2 polices du custom preset', () => {
    const html = generatePdfHtml({ ...minimalArgs, customPreset });
    expect(html).toContain('fonts.googleapis.com');
    expect(html).toContain('Inter');
    expect(html).toContain('Space+Grotesk');
  });
});

// ─────────────────────────────────────────────────────
// 5. POLICES — Extraction et import Google Fonts
// ─────────────────────────────────────────────────────

describe('generatePdfHtml — Polices Google Fonts', () => {
  it('actes-sud-papiers : importe Crimson Text (body = personnage → 1 seul import)', () => {
    const html = generatePdfHtml({ ...minimalArgs, presetId: 'actes-sud-papiers' });
    const links = html.match(/fonts\.googleapis\.com/g) || [];
    expect(links).toHaveLength(1);
    expect(html).toContain('Crimson+Text');
  });

  it('editions-theatrales : importe EB Garamond', () => {
    const html = generatePdfHtml({ ...minimalArgs, presetId: 'editions-theatrales' });
    expect(html).toContain('EB+Garamond');
  });

  it('déduplique quand body et personnage utilisent la même police', () => {
    const html = generatePdfHtml({ ...minimalArgs, presetId: 'arche' });
    const crimsonMatches = html.match(/Crimson\+Text/g) || [];
    // Un seul <link> même si 2 variables pointent vers la même police
    expect(crimsonMatches).toHaveLength(1);
  });

  it('gère une police inconnue avec un fallback générique', () => {
    const customPreset = {
      name: 'Custom',
      layout: 'centered',
      variables: {
        '--page-width': '148mm',
        '--page-height': '210mm',
        '--margin-top': '20mm',
        '--margin-bottom': '25mm',
        '--margin-inside': '20mm',
        '--margin-outside': '15mm',
        '--font-body': "'Libre Baskerville', serif",
        '--font-personnage': "'Libre Baskerville', serif",
        '--font-size-body': '11pt',
        '--line-height': '1.4',
      },
    };
    const html = generatePdfHtml({ ...minimalArgs, customPreset });
    expect(html).toContain('Libre+Baskerville');
    expect(html).toContain('wght@400;600;700');
  });

  it('ne génère pas d\'import si la police n\'est pas entre guillemets', () => {
    const customPreset = {
      name: 'Sans serif',
      layout: 'centered',
      variables: {
        '--page-width': '148mm',
        '--page-height': '210mm',
        '--margin-top': '20mm',
        '--margin-bottom': '25mm',
        '--margin-inside': '20mm',
        '--margin-outside': '15mm',
        '--font-body': 'Georgia, serif',
        '--font-personnage': 'Georgia, serif',
        '--font-size-body': '11pt',
        '--line-height': '1.4',
      },
    };
    const html = generatePdfHtml({ ...minimalArgs, customPreset });
    expect(html).not.toContain('fonts.googleapis.com/css2?family=Georgia');
  });
});

// ─────────────────────────────────────────────────────
// 6. HTML ESCAPING — Injection via titre / sous-titre
// ─────────────────────────────────────────────────────

describe('generatePdfHtml — Échappement HTML', () => {
  it('échappe les balises dans le titre', () => {
    const html = generatePdfHtml({
      ...minimalArgs,
      playTitle: '<script>alert("XSS")</script>',
    });
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;');
  });

  it('échappe les guillemets dans le titre', () => {
    const html = generatePdfHtml({
      ...minimalArgs,
      playTitle: 'L"art & l\'être',
    });
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;');
    expect(html).toContain('&#039;');
  });

  it('gère un titre vide ou null', () => {
    const html = generatePdfHtml({ ...minimalArgs, playTitle: '' });
    expect(html).toContain('<title></title>');
  });

  it('affiche le sous-titre quand il est fourni', () => {
    const html = generatePdfHtml({
      ...minimalArgs,
      playSubtitle: 'Une comédie',
    });
    expect(html).toContain('<p class="auteur">Une comédie</p>');
  });

  it('n\'affiche pas le sous-titre quand il est absent', () => {
    const html = generatePdfHtml(minimalArgs);
    expect(html).not.toContain('class="auteur"');
  });

  it('échappe le sous-titre', () => {
    const html = generatePdfHtml({
      ...minimalArgs,
      playSubtitle: '<img src=x onerror=alert(1)>',
    });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });
});

// ─────────────────────────────────────────────────────
// 7. STRUCTURE HTML — Vérifications de structure
// ─────────────────────────────────────────────────────

describe('generatePdfHtml — Structure HTML', () => {
  const html = generatePdfHtml(minimalArgs);

  it('contient le DOCTYPE html', () => {
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('charge le polyfill PagedJS', () => {
    expect(html).toContain('pagedjs/dist/paged.polyfill.js');
  });

  it('contient le style de base scenacte-template', () => {
    expect(html).toContain('id="scenacte-template-base"');
  });

  it('contient les surcharges preset-overrides', () => {
    expect(html).toContain('id="preset-overrides"');
  });

  it('le preset-overrides vient APRÈS le template-base dans le DOM', () => {
    const basePos = html.indexOf('id="scenacte-template-base"');
    const overridePos = html.indexOf('id="preset-overrides"');
    expect(overridePos).toBeGreaterThan(basePos);
  });

  it('inclut le htmlContent dans le body', () => {
    expect(html).toContain('data-layout="centered"');
    expect(html).toContain('Test');
  });
});

// ─────────────────────────────────────────────────────
// 8. CAS LIMITES — Variables manquantes
// ─────────────────────────────────────────────────────

describe('generatePdfHtml — Variables manquantes dans le preset', () => {
  it('editions-theatrales n\'a pas --space-didascalie-inter mais génère quand même le HTML', () => {
    // Ce preset ne définit pas --space-didascalie-inter
    const preset = DEFAULT_PRESETS['editions-theatrales'];
    expect(preset.variables['--space-didascalie-inter']).toBeUndefined();

    // Mais le HTML est quand même généré sans erreur
    const html = generatePdfHtml({ ...minimalArgs, presetId: 'editions-theatrales' });
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('un custom preset minimal (seulement les variables @page) ne crash pas', () => {
    const minimalPreset = {
      name: 'Minimal',
      layout: 'centered',
      variables: {
        '--page-width': '100mm',
        '--page-height': '150mm',
        '--margin-top': '10mm',
        '--margin-bottom': '10mm',
        '--margin-inside': '10mm',
        '--margin-outside': '10mm',
      },
    };
    const html = generatePdfHtml({ ...minimalArgs, customPreset: minimalPreset });
    expect(html).toContain('size: 100mm 150mm');
    // Pas de Google Fonts import (pas de --font-body)
    expect(html).not.toContain('fonts.googleapis.com');
  });
});

// ─────────────────────────────────────────────────────
// 9. ACTES-SUD spécifiquement (format poche 110mm × 180mm)
//    C'est le cas le plus critique — si le bug @page persistait,
//    ces tests échoueraient car les pages feraient 148mm × 210mm
// ─────────────────────────────────────────────────────

describe('generatePdfHtml — Cas critique : Actes Sud-Papiers (poche)', () => {
  const html = generatePdfHtml({ ...minimalArgs, presetId: 'actes-sud-papiers' });

  it('la taille de page est 110mm 180mm, PAS 148mm 210mm (défaut)', () => {
    const size = extractPageSize(html);
    expect(size).toBe('110mm 180mm');
    expect(size).not.toBe('148mm 210mm');
  });

  it('les marges sont celles du preset poche, pas du défaut', () => {
    const margins = extractPageMargins(html);
    expect(margins.top).toBe('15mm');
    expect(margins.bottom).toBe('20mm');
    // Pas 20mm/25mm (défaut arche)
    expect(margins.top).not.toBe('20mm');
  });

  it('les variables :root sont bien celles du poche', () => {
    const vars = extractCSSVariables(html);
    expect(vars['--page-width']).toBe('110mm');
    expect(vars['--page-height']).toBe('180mm');
    expect(vars['--font-size-body']).toBe('10pt');
    expect(vars['--line-height']).toBe('1.35');
  });
});
