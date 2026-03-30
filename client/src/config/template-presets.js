/**
 * Presets de templates PDF pour Scenacte
 */

export const PAPER_FORMATS = {
  A5: { width: '148mm', height: '210mm', label: 'A5', dimensions: '148 × 210 mm' },
  A4: { width: '210mm', height: '297mm', label: 'A4', dimensions: '210 × 297 mm' },
};

export const DEFAULT_PRESETS = {
  'classique': {
    name: 'Classique',
    description: 'Personnage centré',
    layout: 'centered',
    margins: {
      A5: { top: '15mm', bottom: '20mm', inside: '15mm', outside: '15mm' },
      A4: { top: '20mm', bottom: '25mm', inside: '25mm', outside: '25mm' },
    },
    variables: {
      '--font-body': "'EB Garamond', Garamond, serif",
      '--font-size-body': '11pt',
      '--font-size-personnage': '11pt',
      '--font-size-acte': '16pt',
      '--font-size-scene': '13pt',
      '--line-height': '1.4',
      '--space-replique': '0.6em',
    }
  },
  'moderne': {
    name: 'Moderne',
    description: 'Personnage en ligne',
    layout: 'inline',
    margins: {
      A5: { top: '18mm', bottom: '20mm', inside: '15mm', outside: '15mm' },
      A4: { top: '22mm', bottom: '25mm', inside: '25mm', outside: '25mm' },
    },
    variables: {
      '--font-body': "'Crimson Text', Georgia, serif",
      '--font-size-body': '11pt',
      '--font-size-personnage': '11pt',
      '--font-size-acte': '16pt',
      '--font-size-scene': '13pt',
      '--line-height': '1.4',
      '--space-replique': '0.6em',
    }
  },
};

export const DEFAULT_PRESET_ID = 'classique';

/**
 * Retourne un preset par ID avec fallback sur le défaut.
 * @param {string} presetId - ID du preset à récupérer
 * @returns {Object} - Configuration du preset
 */
export function getPreset(presetId) {
  return DEFAULT_PRESETS[presetId] || DEFAULT_PRESETS[DEFAULT_PRESET_ID];
}

/**
 * Génère un bloc CSS de surcharges à partir des variables d'un preset et du format papier.
 * Les valeurs de @page size et marges sont résolues directement car PagedJS
 * ne garantit pas la résolution des var() dans les règles @page.
 * @param {Object} preset - Objet preset avec ses variables
 * @param {string} [paperFormatId='A5'] - ID du format papier (A4 ou A5)
 * @returns {string} - CSS avec les custom properties et la règle @page résolue
 */
export function generatePresetCSS(preset, paperFormatId = 'A5') {
  const format = PAPER_FORMATS[paperFormatId] || PAPER_FORMATS.A5;
  const margins = preset.margins?.[paperFormatId] || preset.margins?.A5 || { top: '15mm', bottom: '20mm', inside: '15mm', outside: '15mm' };

  const allVars = {
    ...preset.variables,
    '--page-width': format.width,
    '--page-height': format.height,
    '--margin-top': margins.top,
    '--margin-bottom': margins.bottom,
    '--margin-inside': margins.inside,
    '--margin-outside': margins.outside,
  };

  const vars = Object.entries(allVars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  return `:root {\n${vars}\n}\n\n@page {\n  size: ${format.width} ${format.height};\n  margin-top: ${margins.top};\n  margin-bottom: ${margins.bottom};\n  margin-inside: ${margins.inside};\n  margin-outside: ${margins.outside};\n}`;
}
