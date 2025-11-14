import { useRef, useCallback } from 'react';

/**
 * Hook personnalisé pour synchroniser le scroll entre deux éléments
 *
 * @returns {Object} - { editorScrollRef, previewScrollRef, handleEditorScroll, handlePreviewScroll }
 */
export function useSyncScroll() {
  const editorScrollRef = useRef(null);
  const previewScrollRef = useRef(null);
  const isScrollingEditor = useRef(false);
  const isScrollingPreview = useRef(false);
  const editorScrollTimeout = useRef(null);
  const previewScrollTimeout = useRef(null);

  /**
   * Gère le scroll de l'éditeur et synchronise avec le preview
   */
  const handleEditorScroll = useCallback((scrollInfo) => {
    // Éviter les boucles infinies
    if (isScrollingPreview.current) {
      return;
    }

    isScrollingEditor.current = true;

    // Synchroniser le preview
    if (previewScrollRef.current && scrollInfo.percentage !== undefined) {
      previewScrollRef.current.scrollToPercentage(scrollInfo.percentage);
    }

    // Réinitialiser le flag après un court délai
    if (editorScrollTimeout.current) {
      clearTimeout(editorScrollTimeout.current);
    }
    editorScrollTimeout.current = setTimeout(() => {
      isScrollingEditor.current = false;
    }, 100);
  }, []);

  /**
   * Gère le scroll du preview et synchronise avec l'éditeur
   */
  const handlePreviewScroll = useCallback((scrollInfo) => {
    // Éviter les boucles infinies
    if (isScrollingEditor.current) {
      return;
    }

    isScrollingPreview.current = true;

    // Synchroniser l'éditeur
    if (editorScrollRef.current && scrollInfo.percentage !== undefined) {
      editorScrollRef.current.scrollToPercentage(scrollInfo.percentage);
    }

    // Réinitialiser le flag après un court délai
    if (previewScrollTimeout.current) {
      clearTimeout(previewScrollTimeout.current);
    }
    previewScrollTimeout.current = setTimeout(() => {
      isScrollingPreview.current = false;
    }, 100);
  }, []);

  return {
    editorScrollRef,
    previewScrollRef,
    handleEditorScroll,
    handlePreviewScroll
  };
}
