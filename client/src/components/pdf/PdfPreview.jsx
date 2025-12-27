import { useEffect, useRef, useState, forwardRef } from 'react';
import { generatePdfHtml } from '../../utils/pdfExport';
import { Loader } from '../ui/Loader';

/**
 * PdfPreview - Composant de prévisualisation PDF avec PagedJS
 * Utilise une iframe pour isoler les styles PagedJS
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!iframeRef.current) return;

    setIsLoading(true);

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Générer le HTML complet avec PagedJS polyfill
    const fullHtml = generatePdfHtml({
      htmlContent,
      playTitle,
      playSubtitle,
      template,
      pageFormat,
    });

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Écouter l'événement PagedJS ready
    const handlePagedReady = () => {
      const pages = doc.querySelectorAll('.pagedjs_page');
      onPagesRendered?.(pages.length);
      setIsLoading(false);
    };

    // Le polyfill dispatch cet événement quand le rendu est terminé
    iframe.contentWindow.addEventListener('pagedjs-ready', handlePagedReady);

    // Timeout de sécurité
    const timeout = setTimeout(() => {
      setIsLoading(false);
      onPagesRendered?.(0);
    }, 10000);

    return () => {
      iframe.contentWindow?.removeEventListener('pagedjs-ready', handlePagedReady);
      clearTimeout(timeout);
    };
  }, [htmlContent, playTitle, playSubtitle, template, pageFormat, onPagesRendered]);

  return (
    <div className="relative h-full w-full bg-gray-100 rounded border-2 border-black overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader />
          <span className="ml-2 font-ui">Génération des pages...</span>
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
