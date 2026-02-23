import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour scaler une preview de page dans un conteneur
 * @param {string} pageWidth - Largeur de la page (ex: '148mm')
 * @returns {{ containerRef, scale, pageWidthPx }}
 */
export function useScaledPreview(pageWidth) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const PX_PER_MM = 96 / 25.4;
  
  // Convertir mm en px (96dpi)
  const pageWidthPx = parseFloat(pageWidth) * PX_PER_MM;

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const style = getComputedStyle(containerRef.current);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const availableWidth = containerRef.current.clientWidth - paddingX;
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