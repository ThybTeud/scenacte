/**
 * Utilitaires pour l'export PDF avec PagedJS
 * Utilise le nouveau système de templates CSS + presets
 */

import { DEFAULT_PRESETS, DEFAULT_PRESET_ID } from '../config/template-presets.js';

// Import du CSS de base (sera bundlé par Vite)
import templateCss from '../assets/styles/scenacte-template.css?inline';

/**
 * Génère le HTML complet pour le rendu PDF avec PagedJS
 * @param {Object} params
 * @param {string} params.htmlContent - HTML généré par astToHTML
 * @param {string} params.playTitle - Titre de la pièce
 * @param {string} [params.playSubtitle] - Sous-titre de la pièce
 * @param {string} [params.presetId] - ID du preset à utiliser (ex: "arche")
 * @param {Object} [params.customPreset] - Preset custom à utiliser (surcharge presetId)
 * @returns {string} - HTML complet pour le PDF
 */
export function generatePdfHtml({
  htmlContent,
  playTitle,
  playSubtitle,
  presetId = DEFAULT_PRESET_ID,
  customPreset = null,
}) {
  // Récupérer le preset (custom ou depuis les defaults)
  const preset = customPreset || DEFAULT_PRESETS[presetId] || DEFAULT_PRESETS[DEFAULT_PRESET_ID];

  // Générer les surcharges CSS depuis les variables du preset
  const presetOverrides = Object.entries(preset.variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  const presetOverridesCSS = `:root {\n${presetOverrides}\n}

@page {
  size: ${preset.variables['--page-width']} ${preset.variables['--page-height']};
  margin-top: ${preset.variables['--margin-top']};
  margin-bottom: ${preset.variables['--margin-bottom']};
}

@page :left {
  margin-left: ${preset.variables['--margin-outside']};
  margin-right: ${preset.variables['--margin-inside']};
}

@page :right {
  margin-left: ${preset.variables['--margin-inside']};
  margin-right: ${preset.variables['--margin-outside']};
}`;

  // Extraire les polices à importer depuis les variables du preset
  const fontFamilies = new Set();
  if (preset.variables['--font-body']) {
    const match = preset.variables['--font-body'].match(/'([^']+)'/);
    if (match) fontFamilies.add(match[1]);
  }
  if (preset.variables['--font-personnage']) {
    const match = preset.variables['--font-personnage'].match(/'([^']+)'/);
    if (match) fontFamilies.add(match[1]);
  }

  // Générer les imports Google Fonts
  const googleFontsImports = Array.from(fontFamilies)
    .map(font => {
      const fontMap = {
        'Crimson Text': 'family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400',
        'EB Garamond': 'family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400',
        'Inter': 'family=Inter:wght@400;500;600;700',
        'Space Grotesk': 'family=Space+Grotesk:wght@400;500;600;700',
      };
      const query = fontMap[font] || `family=${font.replace(/ /g, '+')}:wght@400;600;700`;
      return `  <link href="https://fonts.googleapis.com/css2?${query}&display=swap" rel="stylesheet">`;
    })
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(playTitle)}</title>

  <!-- PagedJS -->
  <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>

  <!-- Google Fonts -->
${googleFontsImports}

  <!-- CSS de base du template -->
  <style id="scenacte-template-base">
${templateCss}
  </style>

  <!-- Surcharges du preset -->
  <style id="preset-overrides">
${presetOverridesCSS}
  </style>

  <!-- Styles additionnels pour la preview -->
  <style>
    /* Cacher le contenu jusqu'à ce que PagedJS soit prêt */
    body {
      visibility: hidden;
    }

    .pagedjs_pages {
      visibility: visible !important;
    }

    /* Reset */
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <!-- Page de titre -->
  <header class="titre-piece">
    <h1>${escapeHtml(playTitle)}</h1>
    ${playSubtitle ? `<p class="auteur">${escapeHtml(playSubtitle)}</p>` : ''}
  </header>

  <!-- Contenu de la pièce (avec data-layout depuis le preset) -->
  ${htmlContent}
</body>
</html>
  `;
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

/**
 * DEPRECATED - Utiliser le système de presets à la place
 * Génère les styles CSS inline pour la preview de l'éditeur
 * @param {Object} templateSettings - Settings du template depuis la BDD
 * @returns {Object} - Objet de styles CSS React
 */
export function getPreviewStyles(templateSettings) {
  console.warn('getPreviewStyles is deprecated, use preset system instead');
  if (!templateSettings) {
    return {};
  }

  const fontFamily = templateSettings.fontFamily || 'Crimson Text';
  const fontSize = templateSettings.fontSize || 12;
  const lineHeight = templateSettings.lineHeight || 1.6;

  return {
    fontFamily: `'${fontFamily}', serif`,
    fontSize: `${fontSize}pt`,
    lineHeight: lineHeight,
  };
}

/**
 * DEPRECATED - Utiliser le système de presets à la place
 * Génère le CSS pour les éléments théâtraux de la preview
 * @param {Object} templateSettings - Settings du template depuis la BDD
 * @returns {string} - Styles CSS sous forme de string
 */
export function getPreviewCSS(templateSettings) {
  console.warn('getPreviewCSS is deprecated, use preset system instead');
  return '';
}
