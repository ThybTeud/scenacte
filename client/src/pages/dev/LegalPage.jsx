import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { marked } from "marked";

const LEGAL_DOCS = {
    legal: {
        title: "Mentions Légales",
        file: "/legal/LEGAL_NOTICE.md",
    },
    privacy: {
        title: "Politique de Confidentialité",
        file: "/legal/PRIVACY_POLICY.md",
    },
    terms: {
        title: "Conditions Générales d'Utilisation",
        file: "/legal/TERMS_OF_SERVICE.md",
    },
};

export default function LegalPage() {
    const { docType } = useParams();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    const doc = LEGAL_DOCS[docType];

    useEffect(() => {
        if (!doc) return;

        setLoading(true);
        fetch(doc.file)
            .then((res) => res.text())
            .then((md) => {
                setContent(marked.parse(md));
                setLoading(false);
            })
            .catch(() => {
                setContent("<p>Erreur de chargement du document.</p>");
                setLoading(false);
            });
    }, [docType, doc]);

    if (!doc) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Document non trouvé</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft size={16} />
                        Retour
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {loading ? (
                    <p className="text-muted-foreground">Chargement...</p>
                ) : (
                    <article
                        className="prose prose-neutral max-w-none"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                )}
            </main>

            <footer className="border-t mt-16">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <Link
                            to="/dev/legal/legal"
                            className="hover:text-foreground"
                        >
                            Mentions légales
                        </Link>
                        <Link
                            to="/dev/legal/privacy"
                            className="hover:text-foreground"
                        >
                            Confidentialité
                        </Link>
                        <Link
                            to="/dev/legal/terms"
                            className="hover:text-foreground"
                        >
                            CGU
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
