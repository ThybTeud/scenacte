import { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { PdfDocument } from './PdfDocument';
import { Loader } from '../ui/Loader';

/**
 * Composant de prévisualisation PDF avec @react-pdf/renderer
 * Affiche le PDF en temps réel avec mise à jour instantanée lors des changements
 *
 * @param {Object} props
 * @param {Object} props.ast - AST généré par le parser Scenacte
 * @param {string} props.playTitle - Titre de la pièce
 * @param {string} [props.playSubtitle] - Sous-titre optionnel
 * @param {string} [props.template='classic'] - Template de style
 * @param {string} [props.pageFormat='A4'] - Format de page
 */
export function PdfPreview({
  ast,
  playTitle,
  playSubtitle,
  template = 'classic',
  pageFormat = 'A4',
}) {
  const [isClient, setIsClient] = useState(false);

  // S'assurer qu'on est côté client (SSR safety)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ne rien rendre côté serveur
  if (!isClient) {
    return (
      <div className="relative h-full w-full bg-gray-100 rounded border-2 border-black overflow-hidden flex items-center justify-center">
        <Loader />
        <span className="ml-2 font-ui">Chargement...</span>
      </div>
    );
  }

  // Vérifier que l'AST est valide
  if (!ast) {
    return (
      <div className="relative h-full w-full bg-gray-100 rounded border-2 border-black overflow-hidden flex items-center justify-center">
        <span className="font-ui text-gray-500">Aucun contenu à afficher</span>
      </div>
    );
  }

  const document = (
    <PdfDocument
      ast={ast}
      title={playTitle || 'Sans titre'}
      subtitle={playSubtitle}
      template={template}
      pageFormat={pageFormat}
    />
  );

  return (
    <div className="relative h-full w-full bg-gray-100 rounded border-2 border-black overflow-hidden">
      <PDFViewer
        width="100%"
        height="100%"
        showToolbar={true}
        className="border-0"
      >
        {document}
      </PDFViewer>
    </div>
  );
}

export default PdfPreview;
