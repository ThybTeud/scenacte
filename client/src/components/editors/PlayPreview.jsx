import { useEffect, useRef, useMemo } from 'react';
import { PlayParser, astToHTML } from '../../utils/playParser';

/**
 * Composant preview pour afficher le rendu HTML d'une pièce de théâtre
 *
 * @param {Object} props
 * @param {string} props.content - Contenu brut à parser et afficher (rétrocompatibilité)
 * @param {string|null} props.precomputedHTML - HTML pré-calculé (prioritaire si fourni)
 * @param {function} props.onScroll - Callback appelé lors du scroll (scrollInfo) => void
 * @param {React.RefObject} props.scrollSync - Ref pour synchroniser le scroll depuis l'extérieur
 */
export function PlayPreview({ content = '', precomputedHTML = null, onScroll, scrollSync }) {
  const previewRef = useRef(null);
  const parser = useMemo(() => new PlayParser(), []);

  // Cache local pour éviter de re-parser si le contenu n'a pas changé
  const lastContentRef = useRef(null);
  const lastHTMLRef = useRef(null);

  /**
   * Parse le contenu et génère le HTML avec système de priorité :
   * 1. precomputedHTML si fourni
   * 2. Cache local si contenu identique
   * 3. Parsing complet sinon
   */
  const htmlContent = useMemo(() => {
    // Contenu vide
    if (!content && !precomputedHTML) {
      return '<div class="empty-state">Commencez à écrire pour voir le rendu...</div>';
    }

    // Priorité 1 : Utiliser le HTML pré-calculé si fourni
    if (precomputedHTML !== null && precomputedHTML !== '') {
      // Mettre à jour le cache
      lastContentRef.current = content;
      lastHTMLRef.current = precomputedHTML;
      return precomputedHTML;
    }

    // Priorité 2 : Utiliser le cache local si le contenu n'a pas changé
    if (content === lastContentRef.current && lastHTMLRef.current !== null) {
      return lastHTMLRef.current;
    }

    // Priorité 3 : Parser le contenu et mettre en cache
    try {
      const ast = parser.parse(content);
      const html = astToHTML(ast);

      // Mettre en cache
      lastContentRef.current = content;
      lastHTMLRef.current = html;

      return html;
    } catch (error) {
      // Fallback : En cas d'erreur, retourner message d'erreur
      console.error('Erreur lors du parsing:', error);
      return '<div class="error-state">Erreur lors du rendu du contenu</div>';
    }
  }, [content, precomputedHTML, parser]);

  /**
   * Gère le scroll du preview
   */
  useEffect(() => {
    const handleScroll = () => {
      if (previewRef.current && onScroll) {
        const scrollDOM = previewRef.current;
        const scrollInfo = {
          top: scrollDOM.scrollTop,
          height: scrollDOM.scrollHeight,
          clientHeight: scrollDOM.clientHeight,
          percentage: scrollDOM.scrollTop / (scrollDOM.scrollHeight - scrollDOM.clientHeight)
        };
        onScroll(scrollInfo);
      }
    };

    const previewElement = previewRef.current;
    if (previewElement) {
      // { passive: true } pour optimiser les performances du scroll (navigateur)
      previewElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => previewElement.removeEventListener('scroll', handleScroll, { passive: true });
    }
  }, [onScroll]);

  /**
   * Expose les méthodes de scroll via la ref
   */
  useEffect(() => {
    if (scrollSync && previewRef.current) {
      scrollSync.current = {
        scrollToPercentage: (percentage) => {
          const scrollDOM = previewRef.current;
          if (scrollDOM && !isNaN(percentage)) {
            const scrollHeight = scrollDOM.scrollHeight - scrollDOM.clientHeight;
            scrollDOM.scrollTop = scrollHeight * percentage;
          }
        },
        getScrollPercentage: () => {
          const scrollDOM = previewRef.current;
          if (scrollDOM) {
            const scrollHeight = scrollDOM.scrollHeight - scrollDOM.clientHeight;
            return scrollHeight > 0 ? scrollDOM.scrollTop / scrollHeight : 0;
          }
          return 0;
        }
      };
    }
  }, [scrollSync]);

  return (
    <div
      ref={previewRef}
      className="h-full w-full overflow-y-auto border border-gray-300 rounded-lg bg-white p-6"
    >
      <style>{`
        /* Styles pour le rendu de la pièce */
        .play-root {
          font-family: 'Georgia', 'Times New Roman', serif;
          color: #1f2937;
          text-align: center;
        }

        .acte {
          font-weight: 900;
          text-transform: uppercase;
        }

        .scene {
          font-weight: 900;
          text-transform: small-caps;
        }

        .personnage {
          margin: 1rem 0 1rem;
          text-transform: uppercase;
        }

        .didascalie {
          margin: 2rem 0;
          padding-left: 8rem;
          font-style: italic;
          text-align: right;
        }

        .dialogue {
          text-align: justify;
        }

        /* Vérifier l'utilités des styles suivants */
        .text {
          margin: 0.75rem 0;
          color: #1f2937;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #9ca3af;
          font-style: italic;
          text-align: center;
        }

        .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #ef4444;
          font-weight: 500;
          text-align: center;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
