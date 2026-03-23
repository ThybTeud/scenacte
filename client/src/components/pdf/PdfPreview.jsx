import { useEffect, useRef, useState, forwardRef, useCallback } from "react";
import { generatePdfHtml } from "@/utils/pdfExport";
import { Loader } from "@/components/ui/Loader";

// Largeurs des pages en pixels (96 DPI)
const PAGE_WIDTHS = {
    A4: 794, // 210mm
    A5: 559, // 148mm
};

/**
 * PdfPreview - Previsualisation PDF avec PagedJS (fit-to-width automatique)
 * @param {Object} props
 * @param {string} props.htmlContent - Contenu HTML de la piece
 * @param {string} props.playTitle - Titre de la piece
 * @param {string} [props.playSubtitle] - Sous-titre de la piece
 * @param {string} [props.pageFormat='A5'] - Format de page (A4 ou A5)
 * @param {string} props.presetId - ID du preset à utiliser
 * @param {Function} [props.onPagesRendered] - Callback avec le nombre de pages
 * @param {number|null} [props.zoomScale] - Scale manuel (null = auto fit-to-width)
 * @param {Function} [props.onPageChange] - Callback avec la page courante au scroll
 * @param {Function} [props.onFitScaleComputed] - Callback avec la valeur du fit-to-width calculé
 */
export const PdfPreview = forwardRef(function PdfPreview(
    { htmlContent, playTitle, playSubtitle, pageFormat = 'A5', presetId, onPagesRendered, zoomScale, onPageChange, onFitScaleComputed },
    ref
) {
    const containerRef = useRef(null);
    const internalRef = useRef(null);
    const iframeRef = ref || internalRef;
    const [isLoading, setIsLoading] = useState(true);
    const [fitScale, setFitScale] = useState(1);
    const observerRef = useRef(null);

    const effectiveScale = zoomScale ?? fitScale;

    // Calcul du scale pour fit-to-width
    const updateFitScale = useCallback(() => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        const pageWidth = PAGE_WIDTHS[pageFormat] || PAGE_WIDTHS.A4;
        const padding = 32; // Marges visuelles
        const availableWidth = containerWidth - padding;
        const newScale = Math.min(1, availableWidth / pageWidth);

        setFitScale(newScale);
        onFitScaleComputed?.(newScale);
    }, [pageFormat, onFitScaleComputed]);

    // Observer le resize du conteneur
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(updateFitScale);
        resizeObserver.observe(container);
        updateFitScale();

        return () => resizeObserver.disconnect();
    }, [updateFitScale]);

    // Setup IntersectionObserver pour tracker la page courante
    const setupPageObserver = useCallback((iframe) => {
        if (!onPageChange) return;

        const contentWindow = iframe.contentWindow;
        const contentDocument = iframe.contentDocument;
        if (!contentWindow || !contentDocument) return;

        // Disconnect previous observer
        observerRef.current?.disconnect();

        const pages = contentDocument.querySelectorAll(".pagedjs_page");
        if (!pages.length) return;

        const visibilityMap = new Map();

        const observer = new contentWindow.IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    visibilityMap.set(entry.target, entry.intersectionRatio);
                }

                let maxRatio = 0;
                let mostVisiblePage = 0;
                visibilityMap.forEach((ratio, target) => {
                    if (ratio > maxRatio) {
                        maxRatio = ratio;
                        mostVisiblePage = Array.from(pages).indexOf(target);
                    }
                });

                if (maxRatio > 0) {
                    onPageChange(mostVisiblePage + 1);
                }
            },
            { threshold: [0, 0.25, 0.5, 0.75, 1] }
        );

        pages.forEach((page) => observer.observe(page));
        observerRef.current = observer;
    }, [onPageChange]);

    // Injection du HTML et gestion PagedJS
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        setIsLoading(true);

        const fullHtml = generatePdfHtml({
            htmlContent,
            playTitle,
            playSubtitle,
            presetId,
        });

        let timeoutId;
        let pagedReadyTarget = null; // référence capturée pour le cleanup

        const handlePagedReady = () => {
            clearTimeout(timeoutId);
            const pages = iframe.contentDocument?.querySelectorAll(".pagedjs_page");
            onPagesRendered?.(pages?.length || 0);
            setIsLoading(false);
            updateFitScale();
            setupPageObserver(iframe);
        };

        const handleIframeLoad = () => {
            // L'iframe est chargée : le vrai contentWindow est maintenant stable.
            // On attache le listener ici pour être certain de ne jamais le rater,
            // même si PagedJS est en cache navigateur (chargement quasi-instantané).
            const contentWindow = iframe.contentWindow;
            if (!contentWindow) return;

            pagedReadyTarget = contentWindow;
            contentWindow.addEventListener("pagedjs-ready", handlePagedReady);

            timeoutId = setTimeout(() => {
                setIsLoading(false);
                onPagesRendered?.(0);
            }, 10000);
        };

        iframe.addEventListener("load", handleIframeLoad);

        // Blob URL : navigue l'iframe proprement sans document.write()
        // (document.write invalide le contentWindow capturé avant doc.open())
        const blob = new Blob([fullHtml], { type: "text/html" });
        const blobUrl = URL.createObjectURL(blob);
        iframe.src = blobUrl;

        return () => {
            iframe.removeEventListener("load", handleIframeLoad);
            pagedReadyTarget?.removeEventListener("pagedjs-ready", handlePagedReady);
            clearTimeout(timeoutId);
            URL.revokeObjectURL(blobUrl);
            observerRef.current?.disconnect();
        };
    }, [htmlContent, playTitle, playSubtitle, pageFormat, presetId, onPagesRendered, updateFitScale, setupPageObserver]);

    // Injection du style de scale dans l'iframe
    useEffect(() => {
        const iframe = iframeRef.current;
        const doc = iframe?.contentDocument;
        if (!doc?.head) return;

        const styleId = "pdf-preview-scale";
        let styleEl = doc.getElementById(styleId);

        if (!styleEl) {
            styleEl = doc.createElement("style");
            styleEl.id = styleId;
            doc.head.appendChild(styleEl);
        }

        styleEl.textContent = `
    @media screen {
        html {
            background: #d4d4d4;
        }
        .pagedjs_pages {
            transform: scale(${effectiveScale});
            transform-origin: top center;
            padding: 16px 0;
        }
        .pagedjs_page {
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
            margin-bottom: 16px;
        }
    }
`;
    }, [effectiveScale, isLoading]);

    return (
        <div ref={containerRef} className="relative h-full w-full overflow-y-auto">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                    <Loader />
                    <span className="ml-2 text-sm text-muted-foreground">
                        Génération des pages...
                    </span>
                </div>
            )}
            <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="PDF Preview"
            />
        </div>
    );
});
