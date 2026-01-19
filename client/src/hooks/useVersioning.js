import { useState, useRef, useCallback, useEffect } from 'react';
import { versionsService } from '@/services/versions.service';
import { toast } from 'sonner';

// Constantes
const INACTIVITY_DELAY = 10 * 60 * 1000; // 10 minutes
const CHAR_THRESHOLD = 500;

/**
 * Hook de gestion du versioning automatique et manuel
 * Gère les triggers : manual, inactivity (10min), threshold (500 chars), session_close
 *
 * @param {string} playId - ID de la pièce
 * @param {boolean} enabled - Active/désactive le hook (false en mode guest)
 * @returns {Object} { trackChanges, createVersion, hasUnsavedChanges, charsSinceLastVersion }
 */
export function useVersioning(playId, enabled = true) {
  // État interne
  const [charsSinceLastVersion, setCharsSinceLastVersion] = useState(0);
  const [lastVersionTime, setLastVersionTime] = useState(Date.now());
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);

  // Refs
  const inactivityTimerRef = useRef(null);

  /**
   * Créer une version
   * @param {string} versionType - 'manual' | 'inactivity' | 'threshold' | 'session_close'
   * @param {string} manualLabel - Label optionnel (seulement pour manual)
   */
  const createVersion = useCallback(
    async (versionType, manualLabel = null) => {
      if (!enabled || !playId || isCreatingVersion) {
        return;
      }

      // Ne pas créer de version si aucun changement
      if (charsSinceLastVersion === 0 && versionType !== 'manual') {
        return;
      }

      setIsCreatingVersion(true);

      try {
        const response = await versionsService.createVersion(playId, versionType, manualLabel);

        // Gérer le cas où la version est skippée (contenu identique)
        if (response.skipped) {
          console.log('[Versioning] Version skipped - no changes detected');
          setCharsSinceLastVersion(0);
          setLastVersionTime(Date.now());
          return;
        }

        // Version créée avec succès
        setCharsSinceLastVersion(0);
        setLastVersionTime(Date.now());

        // Toast seulement pour version manuelle
        if (versionType === 'manual') {
          toast.success('Point de restauration créé');
        } else {
          console.log(`[Versioning] Version créée (${versionType})`);
        }
      } catch (error) {
        console.error('[Versioning] Error creating version:', error);

        // Toast d'erreur seulement pour version manuelle
        if (versionType === 'manual') {
          toast.error('Erreur lors de la création du point de restauration');
        }
      } finally {
        setIsCreatingVersion(false);
      }
    },
    [enabled, playId, charsSinceLastVersion, isCreatingVersion]
  );

  /**
   * Reset le timer d'inactivité
   */
  const resetInactivityTimer = useCallback(() => {
    if (!enabled) return;

    // Clear le timer existant
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Créer un nouveau timer seulement s'il y a des changements non versionnés
    if (charsSinceLastVersion > 0) {
      inactivityTimerRef.current = setTimeout(() => {
        createVersion('inactivity');
      }, INACTIVITY_DELAY);
    }
  }, [enabled, charsSinceLastVersion, createVersion]);

  /**
   * Track les changements de contenu
   * @param {string} oldContent - Ancien contenu
   * @param {string} newContent - Nouveau contenu
   */
  const trackChanges = useCallback(
    (oldContent, newContent) => {
      if (!enabled || !oldContent || !newContent) {
        return;
      }

      // Calculer le delta de caractères
      const delta = Math.abs(newContent.length - oldContent.length);

      if (delta === 0) {
        return;
      }

      // Incrémenter le compteur
      const newTotal = charsSinceLastVersion + delta;
      setCharsSinceLastVersion(newTotal);

      // Reset le timer d'inactivité
      resetInactivityTimer();

      // Vérifier le seuil de caractères
      if (newTotal >= CHAR_THRESHOLD) {
        createVersion('threshold');
      }
    },
    [enabled, charsSinceLastVersion, resetInactivityTimer, createVersion]
  );

  /**
   * Cleanup : clear timer au unmount
   */
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  /**
   * Réinitialiser le timer quand charsSinceLastVersion change
   */
  useEffect(() => {
    resetInactivityTimer();
  }, [charsSinceLastVersion, resetInactivityTimer]);

  return {
    trackChanges,
    createVersion,
    hasUnsavedChanges: charsSinceLastVersion > 0,
    charsSinceLastVersion,
    isCreatingVersion,
  };
}
