import { useEffect, useRef, useMemo } from 'react';
import { PlayParser, astToHTML } from '../../utils/playParser';

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
  /* === Base === */
  .play-root {
    font-family: 'Crimson Text', Georgia, serif;
    color: #1a1a1a;
    line-height: 1.45;
    max-width: 600px;
    margin: 0 auto;
  }

  /* === Actes === */
  h1.acte {
    font-size: 1.5rem;
    font-weight: 900;
    text-transform: uppercase;
    text-align: center;
    margin: 2em 0 1em;
  }

  /* === Scènes === */
  h2.scene {
    font-size: 1.2rem;
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
    margin: 1.5em 0 1em;
  }

  /* === Répliques === */
  .personnage-container {
    margin-bottom: 0.8em;
  }

  h3.personnage {
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    text-align: center;
    margin: 0 0 0.3em;
  }

  /* Personnage SANS pré-réplique */
  .personnage-container:not(:has(> .didascalie[data-type="pre"])) h3.personnage::after {
    content: none;
  }

  /* Personnage AVEC pré-réplique : inline + virgule */
  .personnage-container:has(> .didascalie[data-type="pre"]) {
    text-align: center;
  }
  .personnage-container:has(> .didascalie[data-type="pre"]) h3.personnage {
    display: inline;
  }
  .personnage-container:has(> .didascalie[data-type="pre"]) h3.personnage::after {
    content: ', ';
    font-weight: normal;
  }

  /* === Dialogue === */
  p.dialogue {
    text-align: justify;
    margin: 0.2em 0;
  }

  /* === Didascalies === */
  .didascalie {
    font-style: italic;
  }

  /* Liminaire */
  p.didascalie[data-type="opening"] {
    text-align: justify;
    margin: 0.8em 0;
  }

  /* Inter-répliques */
  p.didascalie[data-type="between"] {
    display: block;
    text-align: right;
    width: fit-content;
    margin-left: auto;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

  /* Pré-réplique */
  p.didascalie[data-type="pre"] {
    display: inline;
    margin: 0;
    text-transform: lowercase;
  }
  p.didascalie[data-type="pre"]::before {
    content: none;
  }
  p.didascalie[data-type="pre"]::after {
    content: '.';
  }

  /* Intra-réplique */
  span.didascalie[data-type="intra"]::before {
    content: '(';
  }
  span.didascalie[data-type="intra"]::after {
    content: ')';
  }

  /* === États vides / erreur === */
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
