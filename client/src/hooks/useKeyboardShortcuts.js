import { useEffect, useRef } from 'react';

/**
 * Hook pour gérer les raccourcis clavier de l'éditeur
 *
 * @param {Object} callbacks
 * @param {Function} callbacks.onInsertFormat - Fonction appelée avec le format à insérer
 * @param {boolean} enabled - Active/désactive les raccourcis
 */
export function useKeyboardShortcuts({ onInsertFormat }, enabled = true) {
  // State pour le cycle CTRL+1 (acte → scène → dialogue)
  const cycleIndexRef = useRef(0);
  const cycleFormats = ['acte', 'scene', 'dialogue'];

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Vérifier si Ctrl (ou Cmd sur Mac) est pressé
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (!isCtrlOrCmd) return;

      // CTRL + 1 : Cycle entre Acte, Scène, Dialogue
      if (e.key === '1' || e.key === '&') { // '&' est la touche 1 sur certains claviers FR
        e.preventDefault();
        const format = cycleFormats[cycleIndexRef.current];
        onInsertFormat(format);

        // Passer au suivant dans le cycle
        cycleIndexRef.current = (cycleIndexRef.current + 1) % cycleFormats.length;
        return;
      }

      // CTRL + 2 : Personnage
      if (e.key === '2' || e.key === 'é') { // 'é' est la touche 2 sur clavier FR
        e.preventDefault();
        onInsertFormat('personnage');
        return;
      }

      // CTRL + 3 : Didascalie
      if (e.key === '3' || e.key === '"') { // '"' est la touche 3 sur clavier FR
        e.preventDefault();
        onInsertFormat('didascalie');
        return;
      }

      // CTRL + 4 : Dialogue
      if (e.key === '4' || e.key === "'") { // "'" est la touche 4 sur clavier FR
        e.preventDefault();
        onInsertFormat('dialogue');
        return;
      }
    };

    // Ajouter l'écouteur d'événements
    document.addEventListener('keydown', handleKeyDown);

    // Nettoyer l'écouteur lors du démontage
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onInsertFormat]);

  // Exposer une fonction pour réinitialiser le cycle
  const resetCycle = () => {
    cycleIndexRef.current = 0;
  };

  return { resetCycle };
}
