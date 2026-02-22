/**
 * Presets de templates PDF pour Scenacte
 */

export const DEFAULT_PRESETS = {
  'classique': {
    name: 'Classique',
    description: 'A5, personnage centré',
    layout: 'centered',
    pageFormat: 'A5',
    variables: {
      '--page-width': '148mm',
      '--page-height': '210mm',
      '--margin-top': '15mm',
      '--margin-bottom': '20mm',
      '--margin-inside': '15mm',
      '--margin-outside': '15mm',
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
    description: 'A5, personnage en ligne',
    layout: 'inline',
    pageFormat: 'A5',
    variables: {
      '--page-width': '148mm',
      '--page-height': '210mm',
      '--margin-top': '18mm',
      '--margin-bottom': '20mm',
      '--margin-inside': '15mm',
      '--margin-outside': '15mm',
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
 * Génère un bloc CSS de surcharges à partir des variables d'un preset.
 * Les valeurs de @page size et marges sont résolues directement car PagedJS
 * ne garantit pas la résolution des var() dans les règles @page.
 * @param {Object} preset - Objet preset avec ses variables
 * @returns {string} - CSS avec les custom properties et la règle @page résolue
 */
export function generatePresetCSS(preset) {
  const vars = Object.entries(preset.variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  // Résoudre les valeurs directement dans @page pour garantir leur prise en compte par PagedJS
  const pageWidth = preset.variables['--page-width'] || '148mm';
  const pageHeight = preset.variables['--page-height'] || '210mm';
  const marginTop = preset.variables['--margin-top'] || '20mm';
  const marginBottom = preset.variables['--margin-bottom'] || '25mm';
  const marginInside = preset.variables['--margin-inside'] || '20mm';
  const marginOutside = preset.variables['--margin-outside'] || '15mm';

  return `:root {\n${vars}\n}\n\n@page {\n  size: ${pageWidth} ${pageHeight};\n  margin-top: ${marginTop};\n  margin-bottom: ${marginBottom};\n  margin-inside: ${marginInside};\n  margin-outside: ${marginOutside};\n}`;
}
