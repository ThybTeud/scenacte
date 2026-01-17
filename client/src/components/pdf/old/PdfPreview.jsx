import { useEffect, useRef, useState, forwardRef } from "react";
import { generatePdfHtml } from "@/utils/pdfExport";
import { Loader } from "@/components/ui/Loader";

/**
 * PdfPreview - Prévisualisation PDF avec PagedJS (fit-to-width automatique)
 */
export const PdfPreview = forwardRef(function PdfPreview(
    { htmlContent, playTitle, playSubtitle, template, pageFormat, onPagesRendered },
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

    return (
        <div className="relative h-full w-full">
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
