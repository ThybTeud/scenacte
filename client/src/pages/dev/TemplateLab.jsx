import { useState, useRef, useEffect } from 'react';
import { DEFAULT_PRESETS, DEFAULT_PRESET_ID, PRESET_ORDER } from '../../config/template-presets';
import baseCSS from '../../assets/styles/scenacte-template.css?inline';
import { LAB_HTML_CONTENT } from './lab-content';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Printer, Info } from 'lucide-react';

/**
 * Template Lab — Outil de développement pour ajuster les templates PDF
 * Dev only, accessible uniquement via /lab en mode développement
 */
export default function TemplateLab() {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  const currentPreset = DEFAULT_PRESETS[presetId];

  // Générer le HTML complet pour l'iframe (même logique que pdfExport.js)
  const generateLabHTML = () => {
    const preset = currentPreset;

    // Générer les surcharges CSS depuis les variables du preset
    const presetOverrides = Object.entries(preset.variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');

    const presetOverridesCSS = `:root {\n${presetOverrides}\n}`;

    // Extraire les polices à importer
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

    // Appliquer le layout du preset sur .piece
    const htmlWithLayout = LAB_HTML_CONTENT.replace(
      'data-layout="centered"',
      `data-layout="${preset.layout}"`
    );

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Template Lab — ${preset.name}</title>

  <!-- Google Fonts -->
${googleFontsImports}

  <!-- CSS de base du template -->
  <style id="scenacte-template-base">
${baseCSS}
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
      margin: 0;
      padding: 0;
    }

    .pagedjs_pages {
      visibility: visible !important;
    }

    /* Séparation visuelle entre les pages */
    .pagedjs_page {
      margin-bottom: 20px !important;
      border: 1px solid #e0e0e0 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    }

    /* Reset */
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  ${htmlWithLayout}

  <!-- PagedJS - chargé après le contenu pour éviter les erreurs de timing -->
  <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
</body>
</html>
    `;
  };

  // Injecter le HTML dans l'iframe à chaque changement de preset
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoading(true);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const fullHtml = generateLabHTML();

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Détecter quand PagedJS a terminé la pagination
    const contentWindow = iframe.contentWindow;
    let observer;
    let checkInterval;

    const checkPagedJSReady = () => {
      const pagedPages = doc.querySelector('.pagedjs_pages');
      if (pagedPages && pagedPages.children.length > 0) {
        setIsLoading(false);
        if (observer) observer.disconnect();
        if (checkInterval) clearInterval(checkInterval);
        return true;
      }
      return false;
    };

    // Vérifier immédiatement et périodiquement
    if (!checkPagedJSReady()) {
      // Utiliser un MutationObserver pour détecter les changements
      observer = new MutationObserver(() => {
        checkPagedJSReady();
      });

      // Attendre que doc.body existe avant d'observer
      const startObserving = () => {
        if (doc.body) {
          observer.observe(doc.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
          });
        } else {
          // Si body n'existe pas encore, réessayer dans 50ms
          setTimeout(startObserving, 50);
        }
      };
      startObserving();

      // Vérification périodique comme fallback
      checkInterval = setInterval(() => {
        checkPagedJSReady();
      }, 200);

      // Timeout de sécurité (5s au lieu de 10s)
      setTimeout(() => {
        setIsLoading(false);
        if (observer) observer.disconnect();
        if (checkInterval) clearInterval(checkInterval);
      }, 5000);
    }

    return () => {
      if (observer) observer.disconnect();
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [presetId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fonction d'impression
  const handlePrint = () => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow.focus();
    iframeRef.current.contentWindow.print();
  };

  // Extraire les infos du preset pour l'affichage
  const getPresetInfo = () => {
    const pageWidth = currentPreset.variables['--page-width'];
    const pageHeight = currentPreset.variables['--page-height'];
    const fontFamily = currentPreset.variables['--font-body']?.match(/'([^']+)'/)?.[1] || 'Crimson Text';
    const fontSize = currentPreset.variables['--font-size-body'];

    // Déterminer le format
    let format = 'Custom';
    if (pageWidth === '148mm' && pageHeight === '210mm') format = 'A5';
    else if (pageWidth === '210mm' && pageHeight === '297mm') format = 'A4';
    else if (pageWidth === '110mm' && pageHeight === '180mm') format = 'Poche';
    else if (pageWidth === '140mm' && pageHeight === '210mm') format = 'Intermédiaire';

    return {
      format,
      pageWidth,
      pageHeight,
      fontFamily,
      fontSize,
      layout: currentPreset.layout,
    };
  };

  const info = getPresetInfo();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-100">
      {/* Sidebar */}
      <div className="w-80 bg-stone-50 border-r border-stone-200 flex flex-col p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Template Lab</h1>
          <p className="text-sm text-stone-600">Outil de développement PDF</p>
        </div>

        {/* Sélecteur de preset */}
        <div className="space-y-4 flex-1">
          <div>
            <label className="text-xs font-medium text-stone-700 uppercase tracking-wide mb-2 block">
              Preset
            </label>
            <Select value={presetId} onValueChange={setPresetId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un preset" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_ORDER.map((id) => {
                  const preset = DEFAULT_PRESETS[id];
                  return (
                    <SelectItem key={id} value={id}>
                      {preset.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Info preset actif */}
          <div className="bg-stone-100 rounded-lg p-4 border border-stone-200">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-4 h-4 text-stone-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">{currentPreset.name}</h3>
                <p className="text-xs text-stone-600 mt-1">{currentPreset.description}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-600">Format</span>
                <span className="font-medium text-stone-900">{info.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Dimensions</span>
                <span className="font-medium text-stone-900">{info.pageWidth} × {info.pageHeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Police</span>
                <span className="font-medium text-stone-900">{info.fontFamily}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Taille</span>
                <span className="font-medium text-stone-900">{info.fontSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Layout</span>
                <span className="font-medium text-stone-900">
                  {info.layout === 'centered' ? 'Centré' :
                   info.layout === 'inline' ? 'En ligne' : 'Marginal'}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 Utilisation</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Modifiez <code className="bg-blue-100 px-1 rounded">scenacte-template.css</code></li>
              <li>• Le rendu se met à jour automatiquement (HMR)</li>
              <li>• Changez de preset pour tester</li>
              <li>• Cliquez "Imprimer" pour le PDF final</li>
            </ul>
          </div>
        </div>

        {/* Bouton Print */}
        <Button
          onClick={handlePrint}
          className="w-full mt-4"
          disabled={isLoading}
        >
          <Printer className="w-4 h-4 mr-2" />
          {isLoading ? 'Chargement...' : 'Imprimer / PDF'}
        </Button>
      </div>

      {/* Zone principale - iframe */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-stone-200 p-8">
        <div className="w-full mx-auto" style={{ maxWidth: '210mm' }}>
          {isLoading && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
              <p className="text-stone-600">Génération des pages...</p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="w-full bg-white rounded-lg shadow-lg border-0"
            style={{ minHeight: '297mm', display: isLoading ? 'none' : 'block' }}
            title="Template Lab Preview"
          />
        </div>
      </div>
    </div>
  );
}
