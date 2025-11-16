import { useEffect } from 'react';

/**
 * Hook pour gérer les raccourcis clavier de l'éditeur
 *
 * @param {Object} callbacks
 * @param {Function} callbacks.onToggleFormat - Fonction appelée avec le format à toggle
 * @param {boolean} enabled - Active/désactive les raccourcis
 */
export function useKeyboardShortcuts({ onToggleFormat }, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Vérifier si Ctrl (ou Cmd sur Mac) est pressé
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (!isCtrlOrCmd) return;

      // CTRL + 1 : Toggle Acte/Scène (# → ## → rien)
      if (e.key === '1' || e.key === '&') { // '&' est la touche 1 sur certains claviers FR
        e.preventDefault();
        onToggleFormat('acte'); // 'acte' et 'scene' utilisent tous les deux 'heading'
        return;
      }

      // CTRL + 2 : Toggle Personnage (@ ↔ rien)
      if (e.key === '2' || e.key === 'é') { // 'é' est la touche 2 sur clavier FR
        e.preventDefault();
        onToggleFormat('personnage');
        return;
      }

      // CTRL + 3 : Toggle Didascalie (() ↔ rien)
      if (e.key === '3' || e.key === '"') { // '"' est la touche 3 sur clavier FR
        e.preventDefault();
        onToggleFormat('didascalie');
        return;
      }

      // CTRL + 4 : Dialogue (enlève toutes les balises)
      if (e.key === '4' || e.key === "'") { // "'" est la touche 4 sur clavier FR
        e.preventDefault();
        onToggleFormat('dialogue');
        return;
      }
    };

    // Ajouter l'écouteur d'événements
    document.addEventListener('keydown', handleKeyDown);

    // Nettoyer l'écouteur lors du démontage
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onToggleFormat]);

  return {};
}
