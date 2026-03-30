import { useRef, useCallback } from 'react';

/**
 * Hook pour synchroniser le scroll de l'éditeur vers la preview (unidirectionnel).
 *
 * Stratégie : quand l'éditeur scroll, on identifie la première ligne visible
 * et on demande à la preview de scroller vers l'élément correspondant.
 *
 * @returns {Object} - { previewScrollRef, scrollContainerRef, handleEditorScroll }
 */
export function useSyncScroll() {
  // Ref vers l'instance ShadowPreview (expose scrollToLine)
  const previewScrollRef = useRef(null);
  // Ref vers le conteneur scrollable de la preview (le div overflow-auto)
  const scrollContainerRef = useRef(null);

  /**
   * Appelé à chaque scroll de l'éditeur.
   * @param {Object} scrollInfo - { firstVisibleLine: number } (0-indexed)
   */
  const handleEditorScroll = useCallback(({ firstVisibleLine }) => {
    if (
      previewScrollRef.current &&
      scrollContainerRef.current &&
      firstVisibleLine !== undefined
    ) {
      previewScrollRef.current.scrollToLine(firstVisibleLine, scrollContainerRef.current);
    }
  }, []);

  return {
    previewScrollRef,
    scrollContainerRef,
    handleEditorScroll,
  };
}
