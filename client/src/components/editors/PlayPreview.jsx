import { useEffect, useRef, useMemo } from 'react';
import { PlayParser } from '@/utils/playParser';
import { astToHTML } from '@/utils/playTransformers';

/**
 * Composant preview pour afficher le rendu HTML d'une pièce de théâtre
 *
 * @param {Object} props
 * @param {string} props.content - Contenu brut à parser et afficher
 * @param {function} props.onScroll - Callback appelé lors du scroll (scrollInfo) => void
 * @param {React.RefObject} props.scrollSync - Ref pour synchroniser le scroll depuis l'extérieur
 */
export function PlayPreview({ content = '', onScroll, scrollSync }) {
  const previewRef = useRef(null);
  const parser = useMemo(() => new PlayParser(), []);

  /**
   * Parse le contenu et génère le HTML
   */
  const htmlContent = useMemo(() => {
    if (!content) {
      return '<div class="empty-state">Commencez à écrire pour voir le rendu...</div>';
    }

    try {
      const ast = parser.parse(content);
      return astToHTML(ast);
    } catch (error) {
      console.error('Erreur lors du parsing:', error);
      return '<div class="error-state">Erreur lors du rendu du contenu</div>';
    }
  }, [content, parser]);

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
      previewElement.addEventListener('scroll', handleScroll);
      return () => previewElement.removeEventListener('scroll', handleScroll);
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
      className="h-full w-full overflow-y-auto border border-gray-200 rounded bg-white p-6"
    >
      <style>{`
        /* Styles pour le rendu de la pièce */
        .play-root {
          font-family: var(--font-theater);
          color: #1f2937;
          text-align: center;
        }

        .acte {
          font-weight: 900;
          text-transform: uppercase;
        }

        .scene {
          font-weight: 900;
          font-variant-caps: small-caps;
        }

        .personnage {
          margin: 1rem 0 1rem;
          font-variant-caps: small-caps;
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
