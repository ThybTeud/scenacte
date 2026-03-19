import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
            <AppLayout>
                <p>Ce document n'existe pas.</p>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto">
                {loading ? (
                    <p className="text-muted-foreground">Chargement...</p>
                ) : (
                    <article
                        className="prose prose-neutral prose-lg max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                )}
            </div>
        </AppLayout>
    );
}
