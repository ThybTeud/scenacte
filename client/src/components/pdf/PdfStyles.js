import { StyleSheet } from '@react-pdf/renderer';

/**
 * Formats de page supportés
 */
export const PAGE_FORMATS = {
  A4: 'A4',
  LETTER: 'LETTER',
};

/**
 * Dimensions des marges par format (en points)
 */
const MARGINS = {
  A4: { top: 70, right: 55, bottom: 70, left: 55 },
  LETTER: { top: 72, right: 72, bottom: 72, left: 72 },
};

/**
 * Génère les styles pour un template et format donnés
 * @param {string} template - 'classic' | 'modern' | 'minimal'
 * @param {string} pageFormat - 'A4' | 'LETTER'
 * @returns {Object} StyleSheet
 */
export function getStyles(template = 'classic', pageFormat = 'A4') {
  const margins = MARGINS[pageFormat] || MARGINS.A4;
  const baseStyles = getBaseStyles(margins);
  const templateStyles = getTemplateStyles(template);

  // Merger en profondeur pour ne pas écraser les styles de base
  const mergedStyles = { ...baseStyles };
  Object.keys(templateStyles).forEach(key => {
    if (mergedStyles[key]) {
      // Fusionner les propriétés existantes
      mergedStyles[key] = { ...mergedStyles[key], ...templateStyles[key] };
    } else {
      // Ajouter les nouvelles propriétés
      mergedStyles[key] = templateStyles[key];
    }
  });

  return StyleSheet.create(mergedStyles);
}

/**
 * Styles de base communs à tous les templates
 */
function getBaseStyles(margins) {
  return {
    // Page
    page: {
      paddingTop: margins.top,
      paddingRight: margins.right,
      paddingBottom: margins.bottom,
      paddingLeft: margins.left,
      fontFamily: 'Times-Roman',
      fontSize: 12,
      lineHeight: 1.6,
      color: '#1a1a1a',
    },

    // Page de titre
    titlePage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 200,
    },
    titlePageTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    titlePageSubtitle: {
      fontSize: 18,
      fontStyle: 'italic',
      color: '#555555',
      textAlign: 'center',
    },

    // Conteneur principal du contenu
    content: {
      flex: 1,
    },

    // Footer avec numéro de page
    pageNumber: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 10,
      fontFamily: 'Helvetica',
      color: '#666666',
    },

    // Acte
    act: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textAlign: 'center',
      marginTop: 24,
      marginBottom: 12,
    },

    // Scène
    scene: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textAlign: 'center',
      marginTop: 18,
      marginBottom: 12,
    },

    // Personnage
    character: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 6,
    },

    // Didascalie
    stageDirection: {
      fontStyle: 'italic',
      textAlign: 'right',
      marginTop: 9,
      marginBottom: 9,
      paddingLeft: 100,
    },

    // Dialogue
    dialogue: {
      textAlign: 'justify',
      marginTop: 6,
      marginBottom: 6,
    },

    // Groupe personnage + dialogue (pour éviter orphelins)
    characterGroup: {
      marginBottom: 6,
    },
  };
}

/**
 * Styles spécifiques par template
 */
function getTemplateStyles(template) {
  const templates = {
    classic: {
      // Times-Roman, style traditionnel
      act: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 12,
      },
      scene: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 18,
        marginBottom: 12,
      },
    },

    modern: {
      // Helvetica, style contemporain
      page: {
        fontFamily: 'Helvetica',
        fontSize: 11,
      },
      act: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#1a1a1a',
        paddingBottom: 6,
      },
      scene: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 18,
        marginBottom: 12,
        color: '#444444',
      },
      character: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 6,
        letterSpacing: 1,
      },
    },

    minimal: {
      // Style épuré
      page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
      },
      act: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 8,
      },
      scene: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 8,
      },
    },
  };

  return templates[template] || templates.classic;
}

/**
 * Fusionne les styles de base avec les overrides du template
 * @param {Object} baseStyle - Style de base
 * @param {Object} overrideStyle - Style du template (peut être undefined)
 * @returns {Object} Style fusionné
 */
export function mergeStyles(baseStyle, overrideStyle) {
  if (!overrideStyle) return baseStyle;
  return { ...baseStyle, ...overrideStyle };
}
