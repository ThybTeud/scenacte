/**
 * Presets de templates PDF pour Scenacte
 * Chaque preset correspond à une configuration typographique d'un éditeur de théâtre
 */

export const DEFAULT_PRESETS = {
  'actes-sud': {
    name: 'Actes Sud-Papiers',
    description: 'A5 standard, personnage centré',
    layout: 'centered',
    pageFormat: 'A5',
    variables: {
      '--page-width': '148mm',
      '--page-height': '210mm',
      '--margin-top': '15mm',
      '--margin-bottom': '20mm',
      '--margin-inside': '15mm',
      '--margin-outside': '12mm',
      '--font-body': "'EB Garamond', Garamond, serif",
      '--font-size-body': '10pt',
      '--font-size-personnage': '10pt',
      '--font-size-acte': '14pt',
      '--font-size-scene': '12pt',
      '--line-height': '1.35',
      '--space-replique': '0.5em',
      '--color-text' : '#32a852',
    }
  },
  'editions-theatrales': {
    name: 'Éditions Théâtrales',
    description: 'A5 standard, personnage en ligne',
    layout: 'inline',
    pageFormat: 'A5',
    variables: {
      '--page-width': '148mm',
      '--page-height': '210mm',
      '--margin-top': '18mm',
      '--margin-bottom': '22mm',
      '--margin-inside': '18mm',
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
  'arche': {
    name: "L'Arche Éditeur",
    description: 'A5 classique, personnage centré, typographie aérée',
    layout: 'centered',
    pageFormat: 'A5',
    variables: {
      '--page-width': '148mm',
      '--page-height': '210mm',
      '--margin-top': '20mm',
      '--margin-bottom': '25mm',
      '--margin-inside': '20mm',
      '--margin-outside': '15mm',
      '--font-body': "'Crimson Text', Georgia, serif",
      '--font-size-body': '11pt',
      '--font-size-personnage': '11.5pt',
      '--font-size-acte': '18pt',
      '--font-size-scene': '14pt',
      '--line-height': '1.45',
      '--space-replique': '0.8em',
    }
  }
};

export const DEFAULT_PRESET_ID = 'arche';

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
