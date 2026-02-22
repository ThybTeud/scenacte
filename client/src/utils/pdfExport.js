/**
 * Utilitaires pour l'export PDF avec PagedJS
 */

// Import du CSS de base pour le nouveau système de presets
import baseCSS from '../assets/styles/scenacte-template.css?inline';
import { getPreset, generatePresetCSS } from '../config/template-presets';

/**
 * Mapping des polices pour les imports Google Fonts
 */
const FONT_IMPORTS = {
  'Crimson Text': "family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400",
  'Inter': "family=Inter:wght@400;500;600;700",
  'Space Grotesk': "family=Space+Grotesk:wght@400;500;600;700",
};

/**
 * Polices de fallback pour chaque famille
 */
const FONT_FALLBACKS = {
  'Crimson Text': 'Georgia, serif',
  'Inter': 'system-ui, -apple-system, sans-serif',
  'Space Grotesk': 'system-ui, -apple-system, sans-serif',
};

/**
 * Genere le HTML complet pour le rendu PDF avec PagedJS
 * @param {Object} params
 * @param {string} params.htmlContent - HTML genere par astToHTML
 * @param {string} params.playTitle - Titre de la piece
 * @param {string} [params.playSubtitle] - Sous-titre de la piece
 * @param {string} [params.pageFormat='A5'] - Format de page (A4 ou A5)
 * @param {Object} [params.templateSettings] - Settings du template depuis la BDD
 * @param {string} [params.presetId] - ID du preset à utiliser (nouveau système)
 * @returns {string} - HTML complet pour le PDF
 */
export function generatePdfHtml({
  htmlContent,
  playTitle,
  playSubtitle,
  pageFormat = 'A5',
  templateSettings = null,
  presetId = null,
}) {
  // NOUVEAU SYSTÈME : Si presetId est fourni, utiliser le système de presets
  if (presetId) {
    const preset = getPreset(presetId);
    const presetCSS = generatePresetCSS(preset);
    const layout = preset.layout;

    // Extraire la police du preset pour l'import Google Fonts
    const fontFamily = preset.variables['--font-body']?.match(/'([^']+)'/)?.[1];
    const fontImport = fontFamily ? fontFamily.replace(/ /g, '+') : 'Crimson+Text';
    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontImport}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(playTitle || '')}</title>
  <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
  <link href="${googleFontsUrl}" rel="stylesheet">
  <style>${baseCSS}</style>
  <style>${presetCSS}</style>
</head>
<body>
  <section class="title-page">
    <h1>${escapeHtml(playTitle || '')}</h1>
    ${playSubtitle ? `<p class="subtitle">${escapeHtml(playSubtitle)}</p>` : ''}
  </section>
  <section class="play-content">
    <div class="play-root" data-layout="${layout}">
      ${htmlContent}
    </div>
  </section>
  <script>
    // Handler PagedJS pour dispatcher l'événement quand le rendu est terminé
    class PagedHandler extends Paged.Handler {
      constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
      }

      afterRendered(pages) {
        window.dispatchEvent(new Event('pagedjs-ready'));
      }
    }

    Paged.registerHandlers(PagedHandler);
  </script>
</body>
</html>`;
  }

  // ANCIEN SYSTÈME : Comportement conservé pour rétrocompatibilité
  // Settings par defaut si aucun template fourni
  const settings = templateSettings || {
    fontFamily: 'Crimson Text',
    fontSize: 12,
    lineHeight: 1.6,
    margins: { top: 20, bottom: 25, left: 15, right: 15 },
  };

  const fontFamily = settings.fontFamily || 'Crimson Text';
  const fontSize = settings.fontSize || 12;
  const lineHeight = settings.lineHeight || 1.6;
  const margins = settings.margins || { top: 20, bottom: 25, left: 15, right: 15 };

  // Construire l'URL Google Fonts
  const fontImport = FONT_IMPORTS[fontFamily] || FONT_IMPORTS['Crimson Text'];
  const fontFallback = FONT_FALLBACKS[fontFamily] || 'serif';
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontImport}&display=swap`;

  // CSS @page avec format et marges
  const pageStyles = `
    @page {
      size: ${pageFormat};
      margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;

      @bottom-center {
        content: counter(page);
        font-family: '${fontFamily}', ${fontFallback};
        font-size: 10pt;
      }
    }

    @page:first {
      @bottom-center {
        content: none;
      }
    }

    @page title-page {
      @bottom-center { content: none; }
    }
  `;

  // Styles de contenu avec les settings du template
  const contentStyles = `
    /* Reset et base */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    /* Cacher le contenu jusqu'a ce que PagedJS soit pret */
    body {
      font-family: '${fontFamily}', ${fontFallback};
      font-size: ${fontSize}pt;
      line-height: ${lineHeight};
      color: #1a1a1a;
      visibility: hidden;
    }

    /* PagedJS ajoute .pagedjs_pages quand la pagination est terminee */
    .pagedjs_pages {
      visibility: visible;
    }

    /* Page de titre */
    .title-page {
      page: title-page;
      text-align: center;
      padding-top: 30%;
    }

    .title-page h1 {
      font-size: ${Math.round(fontSize * 2.3)}pt;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .title-page .subtitle {
      font-size: ${Math.round(fontSize * 1.5)}pt;
      font-style: italic;
      color: #555;
    }

    /* Contenu theatral */
    .play-content {
      break-before: page;
    }

    .play-content .acte {
      font-size: ${Math.round(fontSize * 1.33)}pt;
      font-weight: 900;
      text-transform: uppercase;
      text-align: center;
      margin: 2rem 0 1rem;
      break-before: page;
    }

    .play-content .scene {
      font-size: ${Math.round(fontSize * 1.17)}pt;
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

    /* Controle des veuves et orphelins */
    p {
      orphans: 3;
      widows: 3;
    }
  `;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(playTitle)}</title>
  <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
  <link href="${googleFontsUrl}" rel="stylesheet">
  <style>
    ${pageStyles}
    ${contentStyles}
  </style>
</head>
<body>
  <!-- Page de titre -->
  <section class="title-page">
    <h1>${escapeHtml(playTitle)}</h1>
    ${playSubtitle ? `<p class="subtitle">${escapeHtml(playSubtitle)}</p>` : ''}
  </section>

  <!-- Contenu de la piece -->
  <section class="play-content">
    ${htmlContent}
  </section>
  <script>
    // Handler PagedJS pour dispatcher l'événement quand le rendu est terminé
    class PagedHandler extends Paged.Handler {
      constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
      }

      afterRendered(pages) {
        window.dispatchEvent(new Event('pagedjs-ready'));
      }
    }

    Paged.registerHandlers(PagedHandler);
  </script>
</body>
</html>
  `;
}

/**
 * Echappe les caracteres HTML pour eviter les injections
 * @param {string} str - Chaine a echapper
 * @returns {string} - Chaine echappee
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
 * Declenche l'impression/telechargement PDF depuis une iframe
 * @param {React.RefObject} iframeRef - Reference a l'iframe
 */
export function printPdf(iframeRef) {
  if (!iframeRef?.current) return;

  const iframe = iframeRef.current;
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
}

/**
 * Genere les styles CSS inline pour la preview de l'editeur
 * @param {Object} templateSettings - Settings du template depuis la BDD
 * @returns {Object} - Objet de styles CSS React
 */
export function getPreviewStyles(templateSettings) {
  if (!templateSettings) {
    return {};
  }

  const fontFamily = templateSettings.fontFamily || 'Crimson Text';
  const fontSize = templateSettings.fontSize || 12;
  const lineHeight = templateSettings.lineHeight || 1.6;
  const fontFallback = FONT_FALLBACKS[fontFamily] || 'serif';

  return {
    fontFamily: `'${fontFamily}', ${fontFallback}`,
    fontSize: `${fontSize}pt`,
    lineHeight: lineHeight,
  };
}

/**
 * Genere le CSS pour la preview inline depuis un preset
 * @param {string} presetId - ID du preset
 * @returns {string} - Styles CSS sous forme de string
 */
export function getPreviewCSSFromPreset(presetId) {
  const preset = getPreset(presetId);
  const vars = preset.variables;

  // Extraire les valeurs du preset
  const fontBody = vars['--font-body']?.replace(/'/g, '') || 'Crimson Text, Georgia, serif';
  const fontSizeBody = vars['--font-size-body']?.replace('pt', '') || '11';
  const lineHeight = vars['--line-height'] || '1.45';
  const fontSizeActe = vars['--font-size-acte']?.replace('pt', '') || '18';
  const fontSizeScene = vars['--font-size-scene']?.replace('pt', '') || '14';
  const fontSizePersonnage = vars['--font-size-personnage']?.replace('pt', '') || '11.5';
  const spaceReplique = vars['--space-replique'] || '0.8em';

  // Adapter le style du personnage selon le layout
  const personnageStyle = preset.layout === 'centered'
    ? `
      display: block;
      text-align: center;
      text-transform: uppercase;
    `
    : `
      display: inline;
      text-transform: uppercase;
    `;

  const dialogueStyle = preset.layout === 'inline'
    ? 'display: inline; text-align: justify;'
    : 'text-align: justify;';

  return `
    .preview-content {
      font-family: ${fontBody};
      font-size: ${fontSizeBody}pt;
      line-height: ${lineHeight};
    }

    .preview-content .acte {
      font-size: ${fontSizeActe}pt;
      font-weight: 900;
      text-transform: uppercase;
      text-align: center;
      margin: 2rem 0 1rem;
    }

    .preview-content .scene {
      font-size: ${fontSizeScene}pt;
      font-weight: 700;
      text-transform: uppercase;
      text-align: center;
      margin: 1.5rem 0 1rem;
    }

    .preview-content .personnage {
      font-size: ${fontSizePersonnage}pt;
      font-weight: 600;
      margin: 1rem 0 0.5rem;
      ${personnageStyle}
    }

    /* Personnage SANS pré-réplique : pas de ponctuation */
    .preview-content .personnage-container:not(:has(> .didascalie[data-type="pre"])) .personnage::after {
      content: none;
    }

    /* Personnage AVEC pré-réplique : inline + virgule */
    .preview-content .personnage-container:has(> .didascalie[data-type="pre"]) {
      text-align: center;
    }
    .preview-content .personnage-container:has(> .didascalie[data-type="pre"]) .personnage {
      display: inline;
    }
    .preview-content .personnage-container:has(> .didascalie[data-type="pre"]) .personnage::after {
      content: ', ';
      font-weight: normal;
    }

    .preview-content .personnage-container {
      margin-bottom: ${spaceReplique};
    }

    /* Base commune */
    .preview-content .didascalie {
      font-style: italic;
    }

    /* Liminaire */
    .preview-content p.didascalie[data-type="opening"] {
      text-align: justify;
      margin: 0.8em 0;
    }

    /* Inter-répliques */
    .preview-content p.didascalie[data-type="between"] {
      display: block;
      text-align: right;
      width: fit-content;
      margin-left: auto;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }

    /* Pré-réplique */
    .preview-content p.didascalie[data-type="pre"] {
      display: inline;
      margin: 0;
      text-transform: lowercase;
    }
    .preview-content p.didascalie[data-type="pre"]::before {
      content: none;
    }
    .preview-content p.didascalie[data-type="pre"]::after {
      content: '.';
    }

    /* Intra-réplique */
    .preview-content span.didascalie[data-type="intra"]::before {
      content: '(';
    }
    .preview-content span.didascalie[data-type="intra"]::after {
      content: ')';
    }

    .preview-content .dialogue {
      ${dialogueStyle}
      margin: 0.2em 0;
    }
  `;
}

/**
 * Genere le CSS pour les elements theatraux de la preview (ancien système BDD)
 * @param {Object} templateSettings - Settings du template depuis la BDD
 * @returns {string} - Styles CSS sous forme de string
 */
export function getPreviewCSS(templateSettings) {
  const settings = templateSettings || {
    fontFamily: 'Crimson Text',
    fontSize: 12,
    lineHeight: 1.6,
  };

  const fontFamily = settings.fontFamily || 'Crimson Text';
  const fontSize = settings.fontSize || 12;
  const lineHeight = settings.lineHeight || 1.6;
  const fontFallback = FONT_FALLBACKS[fontFamily] || 'serif';

  return `
    .preview-content {
      font-family: '${fontFamily}', ${fontFallback};
      font-size: ${fontSize}pt;
      line-height: ${lineHeight};
    }

    .preview-content .acte {
      font-size: ${Math.round(fontSize * 1.33)}pt;
      font-weight: 900;
      text-transform: uppercase;
      text-align: center;
      margin: 2rem 0 1rem;
    }

    .preview-content .scene {
      font-size: ${Math.round(fontSize * 1.17)}pt;
      font-weight: 700;
      text-transform: uppercase;
      text-align: center;
      margin: 1.5rem 0 1rem;
    }

    .preview-content .personnage {
      font-weight: 600;
      text-transform: uppercase;
      text-align: center;
      margin: 1rem 0 0.5rem;
    }

    .preview-content .didascalie {
      font-style: italic;
      text-align: right;
      margin: 0.75rem 0;
      padding-left: 4rem;
    }

    .preview-content .dialogue {
      text-align: justify;
      margin: 0.5rem 0;
    }
  `;
}
