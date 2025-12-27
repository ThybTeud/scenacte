import { useEffect, useRef, useState, forwardRef } from 'react';
import { Previewer } from 'pagedjs';
import { generatePdfDocument, generatePdfStyles } from '../../utils/pdfExport';
import { Loader } from '../ui/Loader';

/**
 * PdfPreview - Composant de prévisualisation PDF avec PagedJS
 * Utilise une iframe pour isoler les styles PagedJS
 * Optimisé pour éviter les rechargements complets lors des changements de template/format
 *
 * @param {Object} props
 * @param {string} props.htmlContent - HTML généré par astToHTML
 * @param {string} props.playTitle - Titre de la pièce
 * @param {string} [props.playSubtitle] - Sous-titre de la pièce
 * @param {string} props.template - Template CSS à utiliser
 * @param {string} props.pageFormat - Format de page (A4, A5, letter)
 * @param {Function} [props.onPagesRendered] - Callback appelé avec le nombre de pages
 */
export const PdfPreview = forwardRef(function PdfPreview({
  htmlContent,
  playTitle,
  playSubtitle,
  template,
  pageFormat,
  onPagesRendered,
}, ref) {
  const iframeRef = ref || useRef(null);
  const previewerRef = useRef(null);
  const sourceContentRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Effect 1 : Initialisation unique du document (contenu HTML)
  useEffect(() => {
    if (!iframeRef.current) return;

    setIsLoading(true);
    setInitialized(false);

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Générer le document HTML (sans PagedJS)
    const documentHtml = generatePdfDocument({
      htmlContent,
      playTitle,
      playSubtitle,
    });

    doc.open();
    doc.write(documentHtml);
    doc.close();

    // Injecter les styles initiaux
    injectStyles(doc, template, pageFormat);

    // Initialiser PagedJS une fois le DOM prêt
    iframe.onload = async () => {
      try {
        // Sauvegarder le contenu source avant que PagedJS le consomme
        const content = doc.querySelector('.play-content');
        if (content) {
          sourceContentRef.current = content.cloneNode(true);
        }

        // Créer une nouvelle instance du Previewer
        previewerRef.current = new Previewer();

        // Effectuer le premier rendu
        await renderPages();

        setInitialized(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation PagedJS:', error);
        setIsLoading(false);
        onPagesRendered?.(0);
      }
    };

    return () => {
      iframe.onload = null;
      sourceContentRef.current = null;
    };
  }, [htmlContent, playTitle, playSubtitle]);

  // Effect 2 : Changement de template/format (CSS uniquement, pas de rechargement)
  useEffect(() => {
    if (!initialized) return;

    const updateStyles = async () => {
      setIsLoading(true);

      try {
        const doc = iframeRef.current.contentDocument;

        // Mettre à jour les styles CSS
        injectStyles(doc, template, pageFormat);

        // Re-render avec les nouveaux styles
        await renderPages();
      } catch (error) {
        console.error('Erreur lors de la mise à jour des styles:', error);
        setIsLoading(false);
      }
    };

    updateStyles();
  }, [template, pageFormat, initialized]);

  /**
   * Fonction de rendu PagedJS
   * Nettoie le rendu précédent et génère les nouvelles pages
   * Utilise sourceContentRef pour éviter les problèmes de contenu consommé par PagedJS
   */
  async function renderPages() {
    if (!iframeRef.current || !previewerRef.current || !sourceContentRef.current) return;

    const doc = iframeRef.current.contentDocument;

    // Nettoyer tout le rendu précédent
    const pagedContainer = doc.querySelector('.pagedjs_pages');
    if (pagedContainer) {
      pagedContainer.remove();
    }

    // Supprimer l'ancien contenu source s'il existe encore
    const oldContent = doc.querySelector('.play-content');
    if (oldContent) {
      oldContent.remove();
    }

    // Réinjecter une copie fraîche du contenu source
    const freshContent = sourceContentRef.current.cloneNode(true);
    doc.body.appendChild(freshContent);

    // Re-render avec PagedJS
    try {
      await previewerRef.current.preview(freshContent, [], doc.body);

      // Compter les pages générées
      const pages = doc.querySelectorAll('.pagedjs_page');
      onPagesRendered?.(pages.length);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du rendu PagedJS:', error);
      setIsLoading(false);
      onPagesRendered?.(0);
    }
  }

  /**
   * Injection dynamique des styles CSS
   * Permet de changer le template/format sans recharger l'iframe
   */
  function injectStyles(doc, template, pageFormat) {
    let styleEl = doc.getElementById('pdf-styles');

    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.id = 'pdf-styles';
      doc.head.appendChild(styleEl);
    }

    styleEl.textContent = generatePdfStyles({ template, pageFormat });
  }

  return (
    <div className="relative h-full w-full bg-gray-100 rounded border-2 border-black overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader />
          <span className="ml-2 font-ui">
            {initialized ? 'Mise à jour...' : 'Génération des pages...'}
          </span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="PDF Preview"
      />
    </div>
  );
});
