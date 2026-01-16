import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { generatePdfHtml } from "@/utils/pdfExport";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

// Largeur d'une page A4 en pixels (à 96 DPI)
const A4_WIDTH_PX = 794;
// Hauteur estimée pour le contenu (sera ajustée dynamiquement)
const IFRAME_HEIGHT = 3000;

/**
 * PdfPreview - Composant de prévisualisation PDF avec PagedJS
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
            const containerWidth = containerRef.current.clientWidth - 32;
            const fitZoom = Math.floor((containerWidth / A4_WIDTH_PX) * 100);
            return Math.max(25, Math.min(150, fitZoom));
        },
    }));

    // Calculer le fit-to-width zoom au montage
    useEffect(() => {
        if (!containerRef.current || !onFitWidthZoom) return;

        const calculateAndNotify = () => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth - 32;
            const fitZoom = Math.floor((containerWidth / A4_WIDTH_PX) * 100);
            const clampedZoom = Math.max(25, Math.min(150, fitZoom));
            onFitWidthZoom(clampedZoom);
        };

        const timeoutId = setTimeout(calculateAndNotify, 100);

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

        const handlePagedReady = () => {
            const pages = doc.querySelectorAll(".pagedjs_page");
            onPagesRendered?.(pages.length);
            setIsLoading(false);
        };

        iframe.contentWindow.addEventListener("pagedjs-ready", handlePagedReady);

        const timeout = setTimeout(() => {
            setIsLoading(false);
            onPagesRendered?.(0);
        }, 10000);

        return () => {
            iframe.contentWindow?.removeEventListener("pagedjs-ready", handlePagedReady);
            clearTimeout(timeout);
        };
    }, [htmlContent, playTitle, playSubtitle, template, pageFormat, onPagesRendered]);

    const scale = zoom / 100;
    // Dimensions scalées pour éviter le scroll horizontal quand fit-to-width
    const scaledWidth = A4_WIDTH_PX * scale;
    const scaledHeight = IFRAME_HEIGHT * scale;

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-auto bg-muted/30 p-4"
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                    <Loader />
                    <span className="ml-2 text-sm text-muted-foreground">
                        Génération des pages...
                    </span>
                </div>
            )}
            {/* Wrapper avec dimensions scalées pour contenir l'iframe transformée */}
            <div
                style={{
                    width: scaledWidth,
                    height: scaledHeight,
                    position: "relative",
                }}
            >
                <iframe
                    ref={iframeRef}
                    className={cn(
                        "border-0 bg-white shadow-lg",
                        isLoading && "opacity-0"
                    )}
                    style={{
                        width: A4_WIDTH_PX,
                        height: IFRAME_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                    title="PDF Preview"
                />
            </div>
        </div>
    );
});
