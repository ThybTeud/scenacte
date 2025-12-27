import { useState, useEffect } from 'react';
import { PDFViewer, BlobProvider } from '@react-pdf/renderer';
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
 * @param {Function} [props.onPagesRendered] - Callback avec le nombre de pages
 * @param {Function} [props.onBlobReady] - Callback avec le blob PDF généré
 */
export function PdfPreview({
  ast,
  playTitle,
  playSubtitle,
  template = 'classic',
  pageFormat = 'A4',
  onPagesRendered,
  onBlobReady,
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
      {/* BlobProvider pour obtenir les métadonnées (nombre de pages) */}
      <BlobProvider document={document}>
        {({ blob, url, loading, error }) => {
          // Notifier le parent quand le blob est prêt
          if (blob && onBlobReady) {
            onBlobReady(blob, url);
          }

          if (error) {
            return (
              <div className="flex items-center justify-center h-full">
                <span className="font-ui text-red-500">
                  Erreur lors de la génération : {error.message}
                </span>
              </div>
            );
          }

          return null;
        }}
      </BlobProvider>

      {/* PDFViewer pour l'affichage */}
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

/**
 * Version alternative avec comptage de pages via BlobProvider
 * Utile si on veut afficher le nombre de pages sans le toolbar du PDFViewer
 */
export function PdfPreviewWithPageCount({
  ast,
  playTitle,
  playSubtitle,
  template = 'classic',
  pageFormat = 'A4',
  onPagesRendered,
}) {
  const [isClient, setIsClient] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !ast) {
    return (
      <div className="relative h-full w-full bg-gray-100 rounded border-2 border-black overflow-hidden flex items-center justify-center">
        <Loader />
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
    <div className="relative h-full w-full">
      <BlobProvider document={document}>
        {({ loading }) => {
          if (loading) {
            return (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Loader />
                <span className="ml-2 font-ui">Génération des pages...</span>
              </div>
            );
          }
          return null;
        }}
      </BlobProvider>

      <PDFViewer width="100%" height="100%" showToolbar={true}>
        {document}
      </PDFViewer>
    </div>
  );
}

export default PdfPreview;
