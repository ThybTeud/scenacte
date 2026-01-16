import { useEffect, useRef, useState, forwardRef } from "react";
import { generatePdfHtml } from "@/utils/pdfExport";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

/**
 * PdfPreview - Composant de prévisualisation PDF avec PagedJS
 * Utilise une iframe pour isoler les styles PagedJS
 *
 * @param {Object} props
 * @param {string} props.htmlContent - HTML généré par astToHTML
 * @param {string} props.playTitle - Titre de la pièce
 * @param {string} [props.playSubtitle] - Sous-titre de la pièce
 * @param {string} props.template - Template CSS à utiliser
 * @param {string} props.pageFormat - Format de page (A4, A5, letter)
 * @param {number} [props.zoom=100] - Niveau de zoom en pourcentage
 * @param {Function} [props.onPagesRendered] - Callback appelé avec le nombre de pages
 */
export const PdfPreview = forwardRef(function PdfPreview(
    {
        htmlContent,
        playTitle,
        playSubtitle,
        template,
        pageFormat,
        zoom = 100,
        onPagesRendered,
    },
    ref
) {
    const internalRef = useRef(null);
    const iframeRef = ref || internalRef;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!iframeRef.current) return;

        setIsLoading(true);

        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        // Générer le HTML complet avec PagedJS polyfill
        const fullHtml = generatePdfHtml({
            htmlContent,
            playTitle,
            playSubtitle,
            template,
            pageFormat,
        });

        doc.open();
        doc.write(fullHtml);
        doc.close();

        // Écouter l'événement PagedJS ready
        const handlePagedReady = () => {
            const pages = doc.querySelectorAll(".pagedjs_page");
            onPagesRendered?.(pages.length);
            setIsLoading(false);
        };

        // Le polyfill dispatch cet événement quand le rendu est terminé
        iframe.contentWindow.addEventListener("pagedjs-ready", handlePagedReady);

        // Timeout de sécurité
        const timeout = setTimeout(() => {
            setIsLoading(false);
            onPagesRendered?.(0);
        }, 10000);

        return () => {
            iframe.contentWindow?.removeEventListener(
                "pagedjs-ready",
                handlePagedReady
            );
            clearTimeout(timeout);
        };
    }, [htmlContent, playTitle, playSubtitle, template, pageFormat, onPagesRendered]);

    // Calculer les dimensions pour le zoom
    const scale = zoom / 100;
    const inverseScale = 100 / zoom;

    return (
        <div className="relative h-full w-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
                    <Loader />
                    <span className="ml-2 text-sm text-muted-foreground">
                        Génération des pages...
                    </span>
                </div>
            )}
            <div
                className="h-full w-full overflow-auto rounded-md border bg-muted/50"
                style={{
                    // Container pour le scroll
                }}
            >
                <div
                    style={{
                        // Wrapper pour le zoom - ajuste la taille pour compenser le scale
                        width: `${inverseScale * 100}%`,
                        height: `${inverseScale * 100}%`,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        className={cn(
                            "w-full h-full border-0 bg-white",
                            isLoading && "opacity-0"
                        )}
                        title="PDF Preview"
                    />
                </div>
            </div>
        </div>
    );
});
