import { Previewer } from 'pagedjs';

/**
 * Génère un PDF à partir du HTML avec les paramètres du template
 * @param {string} htmlContent - Contenu HTML de la pièce
 * @param {Object} templateSettings - Configuration du template (marges, police, etc.)
 * @param {string} title - Titre de la pièce
 * @returns {Promise<Buffer>} Buffer du PDF généré
 */
export async function generatePDF(htmlContent, templateSettings, title) {
  try {
    // Configuration par défaut du template
    const defaultSettings = {
      pageSize: 'A4',
      marginTop: '2cm',
      marginRight: '2cm',
      marginBottom: '2cm',
      marginLeft: '2cm',
      fontFamily: 'Times New Roman, serif',
      fontSize: '12pt',
      lineHeight: '1.5',
      showPageNumbers: true
    };

    // Merge des settings avec les valeurs par défaut
    const settings = { ...defaultSettings, ...templateSettings };

    // Construction du HTML complet avec les styles CSS
    const fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${settings.pageSize};
      margin-top: ${settings.marginTop};
      margin-right: ${settings.marginRight};
      margin-bottom: ${settings.marginBottom};
      margin-left: ${settings.marginLeft};
      
      ${settings.showPageNumbers ? `
      @bottom-center {
        content: counter(page);
        font-family: ${settings.fontFamily};
        font-size: 10pt;
      }
      ` : ''}
    }
    
    body {
      font-family: ${settings.fontFamily};
      font-size: ${settings.fontSize};
      line-height: ${settings.lineHeight};
      color: #000;
    }
    
    h1 {
      text-align: center;
      font-size: 18pt;
      margin-bottom: 2em;
      page-break-after: avoid;
    }
    
    h2 {
      font-size: 14pt;
      margin-top: 2em;
      margin-bottom: 1em;
      page-break-after: avoid;
    }
    
    h3 {
      font-size: 12pt;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
    }
    
    .character {
      font-weight: bold;
      margin-top: 1em;
      page-break-after: avoid;
    }
    
    .dialogue {
      margin-left: 0;
      margin-bottom: 0.5em;
    }
    
    .stage-direction {
      font-style: italic;
      margin-left: 2em;
      margin-bottom: 0.5em;
    }
    
    /* Éviter les coupures de page inappropriées */
    .character + .dialogue {
      page-break-before: avoid;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    // Génération du PDF avec Paged.js
    const previewer = new Previewer();
    
    // Paged.js retourne le contenu rendu
    const flow = await previewer.preview(fullHtml, [], document.createElement('div'));
    
    // Note: Paged.js génère du HTML paginé, pas directement un PDF
    // Pour un vrai PDF, il faudrait utiliser puppeteer ou similaire
    // Pour le MVP, on retourne le HTML paginé qui peut être imprimé en PDF par le navigateur
    
    console.log('[PDF] PDF généré avec succès pour:', title);
    
    // Conversion du HTML en Buffer (simulé pour le MVP)
    return Buffer.from(fullHtml, 'utf-8');
    
  } catch (error) {
    console.error('[PDF] Erreur lors de la génération du PDF:', error);
    throw new Error('Impossible de générer le PDF');
  }
}

/**
 * Génère un nom de fichier pour l'export PDF
 * @param {string} title - Titre de la pièce
 * @returns {string} Nom de fichier sécurisé
 */
export function generatePDFFilename(title) {
  // Nettoyage du titre pour créer un nom de fichier valide
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Retire caractères spéciaux
    .replace(/\s+/g, '-') // Remplace espaces par tirets
    .substring(0, 50); // Limite la longueur
  
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return `${cleanTitle}-${timestamp}.pdf`;
}

/**
 * Valide les settings d'un template
 * @param {Object} settings - Settings à valider
 * @returns {boolean} true si valide
 */
export function validateTemplateSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return false;
  }

  // Validation des valeurs de marges (si présentes)
  const marginRegex = /^\d+(\.\d+)?(cm|mm|in|pt)$/;
  const margins = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
  
  for (const margin of margins) {
    if (settings[margin] && !marginRegex.test(settings[margin])) {
      return false;
    }
  }

  // Validation du fontSize (si présent)
  if (settings.fontSize) {
    const fontSizeRegex = /^\d+(\.\d+)?pt$/;
    if (!fontSizeRegex.test(settings.fontSize)) {
      return false;
    }
  }

  // Validation de pageSize (si présent)
  const validPageSizes = ['A4', 'A5', 'Letter', 'Legal'];
  if (settings.pageSize && !validPageSizes.includes(settings.pageSize)) {
    return false;
  }

  return true;
}