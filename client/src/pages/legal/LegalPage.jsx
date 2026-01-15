import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { Button } from '../../components/ui/Button';

// Configuration marked
marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown (tableaux, etc.)
  breaks: true,     // Convertir \n en <br>
});

export default function LegalPage({ file, title }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${title} - Scenacte`;
    fetch(`/legal/${file}`)
      .then(res => res.text())
      .then(text => {
        setContent(marked.parse(text));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [file, title]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Bouton retour */}
        <Button
          variant='secondary'
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Retour
        </Button>

        {/* Contenu */}
        <article
          className="legal-content bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
