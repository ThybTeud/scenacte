import { useEffect, useRef, useState } from 'react';
import { Previewer } from 'pagedjs';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PdfTemplate } from './PdfTemplate';
import toast from 'react-hot-toast';

/**
 * Modale d'export PDF avec preview PagedJS
 * Affiche une preview paginée de la pièce et permet le téléchargement en PDF
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - État d'ouverture de la modale
 * @param {Function} props.onClose - Callback de fermeture
 * @param {Object} props.play - Objet pièce { title, author, rawContent, created_at }
 */
export function PdfExportModal({ isOpen, onClose, play }) {
  const previewContainerRef = useRef(null);
  const contentRef = useRef(null);
  const [isRendering, setIsRendering] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Initialise PagedJS quand la modale s'ouvre
   */
  useEffect(() => {
    if (!isOpen || !contentRef.current || !previewContainerRef.current) {
      return;
    }

    let isMounted = true;
    setIsRendering(true);
    setError(null);

    const renderPreview = async () => {
      try {
        // Créer une nouvelle instance du previewer
        const paged = new Previewer();

        // Cloner le contenu pour le preview
        const content = contentRef.current.cloneNode(true);

        // Rendre la preview
        const flow = await paged.preview(
          content,
          [],
          previewContainerRef.current
        );

        if (isMounted) {
          setTotalPages(flow.total);
          setIsRendering(false);
          console.log(`PDF rendu: ${flow.total} page(s)`);
        }
      } catch (err) {
        console.error('Erreur lors du rendu PagedJS:', err);
        if (isMounted) {
          setError('Erreur lors de la génération de l\'aperçu PDF');
          setIsRendering(false);
          toast.error('Erreur lors de la génération de l\'aperçu');
        }
      }
    };

    // Petit délai pour s'assurer que le DOM est prêt
    const timeoutId = setTimeout(renderPreview, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      // Nettoyer le container de preview
      if (previewContainerRef.current) {
        previewContainerRef.current.innerHTML = '';
      }
    };
  }, [isOpen, play]);

  /**
   * Gère le téléchargement PDF via window.print()
   */
  const handleDownloadPdf = () => {
    try {
      // Préparer l'impression
      const printStyles = `
        @media print {
          body * {
            visibility: hidden;
          }
          .pdf-print-content,
          .pdf-print-content * {
            visibility: visible;
          }
          .pdf-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;

      // Ajouter les styles d'impression
      const styleElement = document.createElement('style');
      styleElement.textContent = printStyles;
      document.head.appendChild(styleElement);

      // Ajouter une classe au container de preview pour l'impression
      if (previewContainerRef.current) {
        previewContainerRef.current.classList.add('pdf-print-content');
      }

      // Déclencher l'impression
      window.print();

      // Nettoyer après impression
      setTimeout(() => {
        document.head.removeChild(styleElement);
        if (previewContainerRef.current) {
          previewContainerRef.current.classList.remove('pdf-print-content');
        }
      }, 1000);

      toast.success('Impression lancée');
    } catch (err) {
      console.error('Erreur lors de l\'impression:', err);
      toast.error('Erreur lors de l\'impression');
    }
  };

  /**
   * Footer de la modale avec boutons
   */
  const modalFooter = (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        {isRendering ? (
          <span>Génération en cours...</span>
        ) : error ? (
          <span className="text-red-600">{error}</span>
        ) : (
          <span>{totalPages} page{totalPages > 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="md" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleDownloadPdf}
          disabled={isRendering || error}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          }
        >
          Télécharger PDF
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Contenu source caché pour PagedJS */}
      <div style={{ display: 'none' }}>
        <div ref={contentRef}>
          <PdfTemplate play={play} />
        </div>
      </div>

      {/* Modale avec preview */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Aperçu PDF"
        size="xl"
        footer={modalFooter}
      >
        <div className="min-h-[60vh]">
          {isRendering && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet mb-4" />
                <p className="text-gray-600">Génération de l'aperçu...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-600">
                <svg
                  className="w-12 h-12 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Container pour le rendu PagedJS */}
          <div
            ref={previewContainerRef}
            className="pdf-preview-container bg-gray-100 p-4 rounded overflow-y-auto"
            style={{
              maxHeight: '70vh',
              display: isRendering || error ? 'none' : 'block'
            }}
          />
        </div>
      </Modal>
    </>
  );
}

export default PdfExportModal;
