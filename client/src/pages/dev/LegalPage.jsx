import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { marked } from "marked";
import AppLayout from "@/components/layout/AppLayout";

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
            <AppLayout title="Document non trouvé">
                <p>Ce document n'existe pas.</p>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={doc.title}>
            <div className="max-w-3xl mx-auto">
                {loading ? (
                    <p className="text-muted-foreground">Chargement...</p>
                ) : (
                    <article
                        className="prose prose-neutral prose-lg max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                )}

                <footer className="mt-16 pt-6 border-t">
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
                </footer>
            </div>
        </AppLayout>
    );
}
