import { useState, useCallback } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { PdfPreview } from './PdfPreview';
import { PdfDocument } from './PdfDocument';

/**
 * Modale d'export PDF avec preview et options
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - État d'ouverture de la modale
 * @param {Function} props.onClose - Callback de fermeture
 * @param {string} props.playTitle - Titre de la pièce
 * @param {string} [props.playSubtitle] - Sous-titre de la pièce
 * @param {Object} props.ast - AST généré par le parser Scenacte
 */
export function PdfExportModal({
  isOpen,
  onClose,
  playTitle,
  playSubtitle,
  ast,
}) {
// Ajout d'un log pour vérifier l'AST reçu (temporaire)
  console.log('AST reçu dans PdfExportModal:', JSON.stringify(ast, null, 2));

  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [pageFormat, setPageFormat] = useState('A4');

  const templateOptions = [
    { value: 'classic', label: 'Classique' },
    { value: 'modern', label: 'Moderne' },
    { value: 'minimal', label: 'Minimaliste' },
  ];

  const formatOptions = [
    { value: 'A4', label: 'A4' },
    { value: 'A5', label: 'A5 (Livre)' },
    { value: 'LETTER', label: 'Letter (US)' },
  ];

  // Générer un nom de fichier propre
  const getFileName = useCallback(() => {
    const sanitizedTitle = (playTitle || 'piece')
      .toLowerCase()
      .replace(/[^a-z0-9àâäéèêëïîôùûüç]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `${sanitizedTitle}.pdf`;
  }, [playTitle]);

  // Document PDF pour le téléchargement
  const pdfDocument = (
    <PdfDocument
      ast={ast}
      title={playTitle || 'Sans titre'}
      subtitle={playSubtitle}
      template={selectedTemplate}
      pageFormat={pageFormat}
    />
  );

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

          {/* Info sur le template */}
          <div className="mt-4 p-3 bg-cream rounded border-2 border-black">
            <p className="text-sm font-ui font-medium mb-1">
              {templateOptions.find(t => t.value === selectedTemplate)?.label}
            </p>
            <p className="text-xs text-gray-600">
              {getTemplateDescription(selectedTemplate)}
            </p>
          </div>
        </div>

        {/* Zone preview */}
        <div className="flex-1 overflow-hidden">
          <PdfPreview
            ast={ast}
            playTitle={playTitle}
            playSubtitle={playSubtitle}
            template={selectedTemplate}
            pageFormat={pageFormat}
          />
        </div>
      </div>

      {/* Footer avec actions */}
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t-2 border-black">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>

        <PDFDownloadLink
          document={pdfDocument}
          fileName={getFileName()}
          className="inline-flex items-center justify-center px-4 py-2 font-ui font-medium text-white bg-violet border-2 border-black rounded shadow-brutal hover:shadow-brutal-hover transition-shadow"
        >
          {({ loading, error }) => {
            if (loading) {
              return (
                <>
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  Préparation...
                </>
              );
            }
            if (error) {
              return 'Erreur';
            }
            return (
              <>
                <DownloadIcon className="w-5 h-5 mr-2" />
                Télécharger PDF
              </>
            );
          }}
        </PDFDownloadLink>
      </div>
    </Modal>
  );
}

/**
 * Retourne la description d'un template
 */
function getTemplateDescription(template) {
  const descriptions = {
    classic: 'Style traditionnel avec police Serif, idéal pour l\'impression.',
    modern: 'Style contemporain avec police Sans-serif et mise en page aérée.',
    minimal: 'Style épuré avec marges réduites, optimisé pour la lecture.',
  };
  return descriptions[template] || '';
}

/**
 * Icône de téléchargement
 */
function DownloadIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

/**
 * Spinner de chargement
 */
function LoadingSpinner({ className }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default PdfExportModal;
