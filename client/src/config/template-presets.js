/**
 * SCENACTE — Presets de templates PDF
 *
 * Chaque preset définit :
 * - name : Nom affiché à l'utilisateur
 * - description : Description courte du preset
 * - layout : Type de layout ("centered", "inline", "marginal")
 * - variables : Objet des custom properties CSS à surcharger
 *
 * Les presets sont appliqués par templateService.applyPreset()
 */

export const DEFAULT_PRESETS = {
  'actes-sud-papiers': {
    name: 'Actes Sud-Papiers',
    description: 'Format poche classique, personnage centré',
    layout: 'centered',
    variables: {
      '--page-width': '110mm',
      '--page-height': '180mm',
      '--margin-top': '15mm',
      '--margin-bottom': '20mm',
      '--margin-inside': '15mm',
      '--margin-outside': '12mm',
      '--font-body': "'Crimson Text', Georgia, serif",
      '--font-personnage': "'Crimson Text', Georgia, serif",
      '--font-size-body': '10pt',
      '--font-size-personnage': '10pt',
      '--font-size-didascalie': '9pt',
      '--font-size-acte': '14pt',
      '--font-size-scene': '12pt',
      '--line-height': '1.35',
      '--space-replique': '0.5em',
      '--space-didascalie-inter': '0.6em'
    }
  },

  'editions-theatrales': {
    name: 'Éditions Théâtrales',
    description: 'Format standard, personnage en ligne',
    layout: 'inline',
    variables: {
      '--page-width': '140mm',
      '--page-height': '210mm',
      '--margin-top': '18mm',
      '--margin-bottom': '22mm',
      '--margin-inside': '18mm',
      '--margin-outside': '15mm',
      '--font-body': "'EB Garamond', Garamond, serif",
      '--font-personnage': "'EB Garamond', Garamond, serif",
      '--font-size-body': '11pt',
      '--font-size-personnage': '11pt',
      '--font-size-didascalie': '10pt',
      '--font-size-acte': '16pt',
      '--font-size-scene': '13pt',
      '--line-height': '1.4',
      '--space-replique': '0.6em'
    }
  },

  'arche': {
    name: "L'Arche Éditeur",
    description: 'A5 classique, personnage centré, typographie aérée',
    layout: 'centered',
    variables: {
      '--page-width': '148mm',
      '--page-height': '210mm',
      '--margin-top': '20mm',
      '--margin-bottom': '25mm',
      '--margin-inside': '20mm',
      '--margin-outside': '15mm',
      '--font-body': "'Crimson Text', Georgia, serif",
      '--font-personnage': "'Crimson Text', Georgia, serif",
      '--font-size-body': '11pt',
      '--font-size-personnage': '11.5pt',
      '--font-size-didascalie': '10pt',
      '--font-size-acte': '18pt',
      '--font-size-scene': '14pt',
      '--line-height': '1.45',
      '--space-replique': '0.8em',
      '--space-didascalie-inter': '1em'
    }
  }
};

/**
 * Preset par défaut utilisé en fallback
 * (quand aucun preset n'est défini pour la pièce)
 */
export const DEFAULT_PRESET_ID = 'arche';

/**
 * Liste ordonnée des presets pour l'UI de sélection
 */
export const PRESET_ORDER = ['arche', 'actes-sud-papiers', 'editions-theatrales'];
