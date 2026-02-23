import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour scaler une preview de page dans un conteneur
 * @param {string} pageWidth - Largeur de la page (ex: '148mm')
 * @returns {{ containerRef, scale, pageWidthPx }}
 */
export function useScaledPreview(pageWidth) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Convertir mm en px (96dpi)
  const pageWidthPx = parseFloat(pageWidth) * (96 / 25.4);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const padding = 32; // 16px de chaque côté
    const availableWidth = containerWidth - padding;
    const newScale = Math.min(1, availableWidth / pageWidthPx);
    setScale(newScale);
  }, [pageWidthPx]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    updateScale();

    return () => observer.disconnect();
  }, [updateScale]);

  return { containerRef, scale, pageWidthPx };
}