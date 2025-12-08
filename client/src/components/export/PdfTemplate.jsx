import { useMemo } from 'react';
import { PlayParser, astToHTML } from '../../utils/playParser';
import './pdfStyles.css';

/**
 * Template HTML pour l'export PDF d'une pièce de théâtre
 * Génère le HTML formaté pour impression avec PagedJS
 *
 * @param {Object} props
 * @param {Object} props.play - Objet pièce { title, author, content, created_at }
 */
export function PdfTemplate({ play }) {
  const parser = useMemo(() => new PlayParser(), []);

  /**
   * Parse le contenu et génère le HTML structuré
   */
  const htmlContent = useMemo(() => {
    if (!play?.rawContent) {
      return '<div class="empty-state">Aucun contenu à afficher</div>';
    }

    try {
      const ast = parser.parse(play.rawContent);
      return astToHTML(ast);
    } catch (error) {
      console.error('Erreur lors du parsing pour PDF:', error);
      return '<div class="error-state">Erreur lors du rendu du contenu</div>';
    }
  }, [play?.rawContent, parser]);

  /**
   * Formate la date de création
   */
  const formattedDate = useMemo(() => {
    if (!play?.created_at) return '';

    const date = new Date(play.created_at);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [play?.created_at]);

  return (
    <div className="pdf-document">
      {/* Page de titre */}
      <section className="title-page">
        <h1>{play?.title || 'Sans titre'}</h1>
        {play?.author && <p className="author">de {play.author}</p>}
        {formattedDate && <p className="date">{formattedDate}</p>}
      </section>

      {/* Contenu de la pièce */}
      <section
        className="play-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}

export default PdfTemplate;
