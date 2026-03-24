/**
 * Utilitaires pour l'export PDF avec PagedJS
 */

// Import du CSS de base pour le nouveau système de presets
import baseCSS from '@/assets/styles/scenacte-template.css?inline';
import { getPreset, generatePresetCSS } from '@/config/template-presets';

export { baseCSS };

/**
 * Genere le HTML complet pour le rendu PDF avec PagedJS
 * @param {Object} params
 * @param {string} params.htmlContent - HTML genere par astToHTML
 * @param {string} params.playTitle - Titre de la piece
 * @param {string} [params.playSubtitle] - Sous-titre de la piece
 * @param {string} params.presetId - ID du preset à utiliser
 * @param {string} [params.paperFormatId='A5'] - ID du format papier (A4 ou A5)
 * @returns {string} - HTML complet pour le PDF
 */
export function generatePdfHtml({
  htmlContent,
  playTitle,
  playSubtitle,
  presetId,
  paperFormatId = 'A5',
}) {
  const preset = getPreset(presetId);
  const presetCSS = generatePresetCSS(preset, paperFormatId);
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

