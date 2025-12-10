import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { PdfPreview } from './PdfPreview';
import { printPdf } from '../../utils/pdfExport';

/**
 * PdfExportModal - Modale d'export PDF avec preview et options
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - État d'ouverture de la modale
 * @param {Function} props.onClose - Callback de fermeture
 * @param {string} props.playTitle - Titre de la pièce
 * @param {string} [props.playSubtitle] - Sous-titre de la pièce
 * @param {string} props.htmlContent - HTML généré par astToHTML
 * @param {string} [props.rawContent] - Contenu brut (pour régénérer si besoin)
 */
export function PdfExportModal({
  isOpen,
  onClose,
  playTitle,
  playSubtitle,
  htmlContent,
  rawContent,
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [pageFormat, setPageFormat] = useState('A4');
  const [pageCount, setPageCount] = useState(0);
  const iframeRef = useRef(null);

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

  const handlePrint = () => {
    printPdf(iframeRef);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export PDF" size="full">
      <div className="flex h-full gap-4">
        {/* Sidebar gauche - Options */}
        <div className="w-64 flex-shrink-0 border-r-2 border-black pr-4">
          <Select
            label="Template"
            options={templateOptions}
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          />

          <div className="mt-4">
            <Select
              label="Format"
              options={formatOptions}
              value={pageFormat}
              onChange={(e) => setPageFormat(e.target.value)}
            />
          </div>

          {/* Infos : nombre de pages après rendu */}
          <div className="mt-4 p-3 bg-cream rounded border-2 border-black">
            <p className="text-sm font-ui">
              <strong>{pageCount}</strong> page{pageCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Zone preview - iframe */}
        <div className="flex-1 overflow-hidden">
          <PdfPreview
            ref={iframeRef}
            htmlContent={htmlContent}
            playTitle={playTitle}
            playSubtitle={playSubtitle}
            template={selectedTemplate}
            pageFormat={pageFormat}
            onPagesRendered={setPageCount}
          />
        </div>
      </div>

      {/* Footer avec actions */}
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t-2 border-black">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Télécharger PDF
        </Button>
      </div>
    </Modal>
  );
}
