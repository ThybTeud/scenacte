import { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { generatePdfHtml, printPdf } from '../../utils/pdfExport';
import { Loader } from '../ui/Loader';

/**
 * PdfExportModal - Modale d'export PDF avec preview, options, zoom et navigation
 * Responsive avec système d'onglets sur mobile
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - État d'ouverture de la modale
 * @param {Function} props.onClose - Callback de fermeture
 * @param {string} props.playTitle - Titre de la pièce
 * @param {string} [props.playSubtitle] - Sous-titre de la pièce
 * @param {string} props.htmlContent - HTML généré par astToHTML
 */
export function PdfExportModal({
  isOpen,
  onClose,
  playTitle,
  playSubtitle,
  htmlContent,
}) {
  // Options d'export
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [pageFormat, setPageFormat] = useState('A4');

  // État de la prévisualisation
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);

  // Onglet actif (mobile)
  const [activeTab, setActiveTab] = useState('preview');

  // Références
  const iframeRef = useRef(null);
  const pagesRef = useRef([]);

  const templateOptions = [
    { value: 'classic', label: 'Classique' },
    { value: 'modern', label: 'Moderne' },
    { value: 'minimal', label: 'Minimaliste' },
  ];

  const formatOptions = [
    { value: 'A4', label: 'A4' },
    { value: 'A5', label: 'A5 (Livre)' },
    { value: 'letter', label: 'Letter (US)' },
  ];

  const zoomOptions = [
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' },
    { value: 125, label: '125%' },
    { value: 150, label: '150%' },
  ];

  // Générer le HTML et l'injecter dans l'iframe
  useEffect(() => {
    if (!iframeRef.current || !isOpen) return;

    setIsLoading(true);
    setCurrentPage(1);

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    const fullHtml = generatePdfHtml({
      htmlContent,
      playTitle,
      playSubtitle,
      template: selectedTemplate,
      pageFormat,
    });

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Écouter l'événement PagedJS ready
    const handlePagedReady = () => {
      const pages = doc.querySelectorAll('.pagedjs_page');
      pagesRef.current = Array.from(pages);
      setPageCount(pages.length);
      setIsLoading(false);
    };

    iframe.contentWindow.addEventListener('pagedjs-ready', handlePagedReady);

    // Timeout de sécurité
    const timeout = setTimeout(() => {
      setIsLoading(false);
      const pages = doc.querySelectorAll('.pagedjs_page');
      if (pages.length > 0) {
        pagesRef.current = Array.from(pages);
        setPageCount(pages.length);
      }
    }, 10000);

    return () => {
      iframe.contentWindow?.removeEventListener('pagedjs-ready', handlePagedReady);
      clearTimeout(timeout);
    };
  }, [htmlContent, playTitle, playSubtitle, selectedTemplate, pageFormat, isOpen]);

  // Navigation vers une page spécifique
  const goToPage = useCallback((pageNumber) => {
    if (!iframeRef.current || pageNumber < 1 || pageNumber > pageCount) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const pages = doc.querySelectorAll('.pagedjs_page');

    if (pages[pageNumber - 1]) {
      pages[pageNumber - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNumber);
    }
  }, [pageCount]);

  // Détecter la page visible lors du scroll
  useEffect(() => {
    if (!iframeRef.current || isLoading) return;

    const iframe = iframeRef.current;
    const iframeWindow = iframe.contentWindow;

    const handleScroll = () => {
      const doc = iframe.contentDocument || iframeWindow.document;
      const pages = doc.querySelectorAll('.pagedjs_page');

      for (let i = 0; i < pages.length; i++) {
        const rect = pages[i].getBoundingClientRect();
        if (rect.top >= -rect.height / 2 && rect.top < iframeWindow.innerHeight / 2) {
          setCurrentPage(i + 1);
          break;
        }
      }
    };

    iframeWindow.addEventListener('scroll', handleScroll);
    return () => iframeWindow?.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  // Appliquer le zoom
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    if (doc.body) {
      doc.body.style.transform = `scale(${zoom / 100})`;
      doc.body.style.transformOrigin = 'top center';
      doc.body.style.width = `${100 / (zoom / 100)}%`;
    }
  }, [zoom, isLoading]);

  const handlePrint = () => {
    printPdf(iframeRef);
  };

  // Panneau des options
  const OptionsPanel = () => (
    <div className="space-y-4">
      <Select
        label="Template"
        options={templateOptions}
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
      />

      <Select
        label="Format"
        options={formatOptions}
        value={pageFormat}
        onChange={(e) => setPageFormat(e.target.value)}
      />

      {/* Infos : nombre de pages */}
      <div className="p-3 bg-cream rounded border-2 border-black">
        <p className="text-sm font-ui">
          <strong>{pageCount}</strong> page{pageCount > 1 ? 's' : ''}
        </p>
      </div>

      {/* Bouton télécharger (visible seulement sur mobile dans l'onglet options) */}
      <div className="lg:hidden pt-4">
        <Button variant="primary" onClick={handlePrint} className="w-full">
          <DownloadIcon />
          Télécharger PDF
        </Button>
      </div>
    </div>
  );

  // Panneau de prévisualisation
  const PreviewPanel = () => (
    <div className="flex flex-col h-full">
      {/* Barre de contrôles */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-black mb-3">
        {/* Navigation entre pages */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 border-2 border-black rounded hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Page précédente"
          >
            <ChevronLeftIcon />
          </button>

          <span className="px-2 text-sm font-ui min-w-[80px] text-center">
            {currentPage} / {pageCount || '—'}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= pageCount}
            className="p-1.5 border-2 border-black rounded hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Page suivante"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Contrôle de zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            disabled={zoom <= 50}
            className="p-1.5 border-2 border-black rounded hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom arrière"
          >
            <MinusIcon />
          </button>

          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="px-2 py-1 text-sm border-2 border-black rounded font-ui bg-white"
          >
            {zoomOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setZoom((z) => Math.min(150, z + 25))}
            disabled={zoom >= 150}
            className="p-1.5 border-2 border-black rounded hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom avant"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* Zone de prévisualisation */}
      <div className="relative flex-1 bg-gray-200 rounded border-2 border-black overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader />
            <span className="ml-2 font-ui">Génération des pages...</span>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-gray-200"
          title="Prévisualisation PDF"
        />
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export PDF" size="full">
      <div className="flex flex-col h-full">
        {/* Onglets (mobile seulement) */}
        <div className="flex lg:hidden border-b-2 border-black mb-4">
          <button
            onClick={() => setActiveTab('options')}
            className={`flex-1 py-2 px-4 font-ui text-sm font-medium transition-colors ${
              activeTab === 'options'
                ? 'bg-violet text-white'
                : 'bg-cream hover:bg-gray-200'
            }`}
          >
            Options
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 px-4 font-ui text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-violet text-white'
                : 'bg-cream hover:bg-gray-200'
            }`}
          >
            Aperçu
          </button>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Desktop : deux colonnes */}
          <div className="hidden lg:block w-64 flex-shrink-0 border-r-2 border-black pr-4">
            <OptionsPanel />
          </div>

          <div className="hidden lg:flex flex-1 flex-col min-h-0">
            <PreviewPanel />
          </div>

          {/* Mobile : onglets */}
          <div className="lg:hidden flex-1 min-h-0">
            {activeTab === 'options' ? <OptionsPanel /> : <PreviewPanel />}
          </div>
        </div>

        {/* Footer avec actions (desktop seulement) */}
        <div className="hidden lg:flex justify-end gap-3 mt-4 pt-4 border-t-2 border-black">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <DownloadIcon />
            Télécharger PDF
          </Button>
        </div>

        {/* Footer mobile */}
        <div className="lg:hidden flex justify-end gap-3 mt-4 pt-4 border-t-2 border-black">
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
          {activeTab === 'preview' && (
            <Button variant="primary" onClick={handlePrint}>
              <DownloadIcon />
              Télécharger
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Icônes SVG
function DownloadIcon() {
  return (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
