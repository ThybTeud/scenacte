/**
 * Utilitaires pour l'export PDF avec PagedJS
 */

/**
 * Génère le HTML complet pour le rendu PDF avec PagedJS
 * @param {Object} params
 * @param {string} params.htmlContent - HTML généré par astToHTML
 * @param {string} params.playTitle - Titre de la pièce
 * @param {string} [params.playSubtitle] - Sous-titre de la pièce
 * @param {string} [params.template='classic'] - Template CSS à utiliser
 * @param {string} [params.pageFormat='A4'] - Format de page
 * @returns {string} - HTML complet pour le PDF
 */
export function generatePdfHtml({
  htmlContent,
  playTitle,
  playSubtitle,
  template = 'classic',
  pageFormat = 'A4',
}) {
  const pageSize = {
    'A4': 'A4',
    'A5': 'A5',
    'letter': 'letter',
  }[pageFormat];

  // CSS de base pour PagedJS
  const baseStyles = `
    @page {
      size: ${pageSize};
      margin: 25mm 20mm;

      @bottom-center {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 10pt;
      }
    }

    @page:first {
      @bottom-center {
        content: none;
      }
    }
  `;

  // Charger le template CSS correspondant
  const templateStyles = getTemplateStyles(template);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(playTitle)}</title>
  <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    ${baseStyles}
    ${templateStyles}

    /* Reset et base */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
    }

    /* Page de titre */
    .title-page {
      page: title-page;
      text-align: center;
      padding-top: 30%;
    }

    .title-page h1 {
      font-size: 28pt;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .title-page .subtitle {
      font-size: 18pt;
      font-style: italic;
      color: #555;
    }

    @page title-page {
      @bottom-center { content: none; }
    }

    /* Contenu théâtral - hérite de PlayPreview */
    .play-content {
      break-before: page;
    }

    .play-content .acte {
      font-weight: 900;
      text-transform: uppercase;
      text-align: center;
      margin: 2rem 0 1rem;
      break-before: page;
    }

    .play-content .scene {
      font-weight: 700;
      text-transform: uppercase;
      text-align: center;
      margin: 1.5rem 0 1rem;
    }

    .play-content .personnage {
      font-weight: 600;
      text-transform: uppercase;
      text-align: center;
      margin: 1rem 0 0.5rem;
    }

    .play-content .didascalie {
      font-style: italic;
      text-align: right;
      margin: 0.75rem 0;
      padding-left: 4rem;
    }

    .play-content .dialogue {
      text-align: justify;
      margin: 0.5rem 0;
    }
  </style>
</head>
<body>
  <!-- Page de titre -->
  <section class="title-page">
    <h1>${escapeHtml(playTitle)}</h1>
    ${playSubtitle ? `<p class="subtitle">${escapeHtml(playSubtitle)}</p>` : ''}
  </section>

  <!-- Contenu de la pièce -->
  <section class="play-content">
    ${htmlContent}
  </section>
</body>
</html>
  `;
}

/**
 * Retourne les styles CSS spécifiques au template
 * @param {string} template - Nom du template
 * @returns {string} - Styles CSS
 */
function getTemplateStyles(template) {
  const templates = {
    classic: `
      body { font-family: 'Crimson Text', Georgia, serif; }
      .play-content .acte { font-size: 16pt; }
      .play-content .scene { font-size: 14pt; }
    `,
    modern: `
      body { font-family: 'Inter', sans-serif; font-size: 11pt; }
      .play-content .acte {
        font-size: 14pt;
        border-bottom: 2px solid #1a1a1a;
        padding-bottom: 0.5rem;
      }
      .play-content .scene { font-size: 12pt; color: #444; }
      .play-content .personnage { letter-spacing: 0.1em; }
    `,
    minimal: `
      body { font-family: 'Inter', sans-serif; font-size: 10pt; line-height: 1.5; }
      .play-content .acte { font-size: 12pt; margin: 1rem 0; }
      .play-content .scene { font-size: 11pt; }
      @page { margin: 20mm 15mm; }
    `,
  };

  return templates[template] || templates.classic;
}

/**
 * Échappe les caractères HTML pour éviter les injections
 * @param {string} str - Chaîne à échapper
 * @returns {string} - Chaîne échappée
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Déclenche l'impression/téléchargement PDF depuis une iframe
 * @param {React.RefObject} iframeRef - Référence à l'iframe
 */
export function printPdf(iframeRef) {
  if (!iframeRef?.current) return;

  const iframe = iframeRef.current;
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
}
