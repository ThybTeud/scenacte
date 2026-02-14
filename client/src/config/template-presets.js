/**
 * Presets de templates PDF pour Scenacte
 * Chaque preset correspond à une configuration typographique d'un éditeur de théâtre
 */

export const DEFAULT_PRESETS = {
  'actes-sud': {
    name: 'Actes Sud-Papiers',
    description: 'Format poche, personnage centré',
    layout: 'centered',
    pageFormat: 'A5',
    variables: {
      '--page-width': '110mm',
      '--page-height': '180mm',
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
 * @param {Object} preset - Objet preset avec ses variables
 * @returns {string} - CSS avec les custom properties
 */
export function generatePresetCSS(preset) {
  const vars = Object.entries(preset.variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  return `:root {\n${vars}\n}`;
}
