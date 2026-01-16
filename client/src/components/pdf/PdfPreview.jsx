import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { generatePdfHtml } from "@/utils/pdfExport";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

// Largeur d'une page A4 en pixels (à 96 DPI)
const A4_WIDTH_PX = 794;

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
 * @param {Function} [props.onFitWidthZoom] - Callback appelé avec le zoom calculé pour fit-to-width
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
        onFitWidthZoom,
    },
    ref
) {
    const iframeRef = useRef(null);
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    // Exposer l'iframe ref et la méthode de calcul fit-to-width
    useImperativeHandle(ref, () => ({
        get iframe() {
            return iframeRef.current;
        },
        calculateFitWidthZoom() {
            if (!containerRef.current) return 75;
            const containerWidth = containerRef.current.clientWidth - 32; // padding
            const fitZoom = Math.floor((containerWidth / A4_WIDTH_PX) * 100);
            return Math.max(25, Math.min(150, fitZoom));
        },
    }));

    // Calculer le fit-to-width zoom au montage et au resize
    useEffect(() => {
        if (!containerRef.current || !onFitWidthZoom) return;

        const calculateAndNotify = () => {
            const containerWidth = containerRef.current.clientWidth - 32;
            const fitZoom = Math.floor((containerWidth / A4_WIDTH_PX) * 100);
            const clampedZoom = Math.max(25, Math.min(150, fitZoom));
            onFitWidthZoom(clampedZoom);
        };

        // Calculer au montage (avec un petit délai pour que le layout soit stable)
        const timeoutId = setTimeout(calculateAndNotify, 50);

        // Recalculer au resize
        const resizeObserver = new ResizeObserver(calculateAndNotify);
        resizeObserver.observe(containerRef.current);

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
        };
    }, [onFitWidthZoom]);

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

    const scale = zoom / 100;

    return (
        <div ref={containerRef} className="relative h-full w-full overflow-auto rounded-md border bg-muted/50 p-4">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
                    <Loader />
                    <span className="ml-2 text-sm text-muted-foreground">
                        Génération des pages...
                    </span>
                </div>
            )}
            <div
                style={{
                    width: A4_WIDTH_PX,
                    minHeight: "100%",
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                <iframe
                    ref={iframeRef}
                    className={cn(
                        "w-full border-0 bg-white",
                        isLoading && "opacity-0"
                    )}
                    style={{ height: "2000px" }} // Hauteur suffisante pour plusieurs pages
                    title="PDF Preview"
                />
            </div>
        </div>
    );
});
