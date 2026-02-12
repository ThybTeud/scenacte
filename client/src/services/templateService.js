/**
 * SCENACTE — Service de gestion des presets PDF
 *
 * Gère l'application des presets, le stockage des préférences utilisateur,
 * et le fallback localStorage pour les utilisateurs non connectés.
 */

import { DEFAULT_PRESETS, DEFAULT_PRESET_ID } from '../config/template-presets.js';
import { authService } from './auth.service.js';
import { playsService } from './plays.service.js';

const GUEST_PRESET_KEY = 'scenacte_preset_id';

/**
 * Applique un preset sur le document pour le rendu PagedJS.
 *
 * @param {Object} preset - Le preset à appliquer (doit contenir .layout et .variables)
 * @param {HTMLElement} containerElement - Le conteneur .piece (ou parent contenant .piece)
 */
export function applyPreset(preset, containerElement) {
  if (!preset || !preset.variables || !preset.layout) {
    console.error('applyPreset: preset invalide', preset);
    return;
  }

  // 1. Injecter/mettre à jour les custom properties CSS
  let styleElement = document.getElementById('preset-overrides');

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'preset-overrides';
    document.head.appendChild(styleElement);
  }

  const cssVariables = Object.entries(preset.variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  styleElement.textContent = `:root {\n${cssVariables}\n}`;

  // 2. Poser data-layout sur le conteneur .piece
  const pieceElement = containerElement.classList.contains('piece')
    ? containerElement
    : containerElement.querySelector('.piece');

  if (pieceElement) {
    pieceElement.dataset.layout = preset.layout;
  } else {
    console.warn('applyPreset: élément .piece introuvable dans', containerElement);
  }
}

/**
 * Retourne le preset actif pour la pièce en cours.
 *
 * Ordre de priorité :
 * 1. Preset stocké pour la pièce (BDD si connecté, localStorage si invité)
 * 2. Preset par défaut (DEFAULT_PRESET_ID)
 *
 * @param {string} playId - ID de la pièce (optionnel, pour récupération en BDD)
 * @returns {Promise<Object>} Le preset actif (objet complet depuis DEFAULT_PRESETS)
 */
export async function getActivePreset(playId = null) {
  let presetId = null;

  if (authService.isAuthenticated() && playId) {
    // User connecté : récupérer le preset depuis la BDD
    try {
      const play = await playsService.getPlay(playId);
      presetId = play.preset_id || play.template_id; // Fallback sur template_id pour compatibilité
    } catch (error) {
      console.error('Erreur lors de la récupération du preset en BDD:', error);
    }
  } else {
    // User invité : récupérer depuis localStorage
    presetId = localStorage.getItem(GUEST_PRESET_KEY);
  }

  // Fallback sur le preset par défaut si presetId invalide ou non trouvé
  if (!presetId || !DEFAULT_PRESETS[presetId]) {
    presetId = DEFAULT_PRESET_ID;
  }

  return {
    id: presetId,
    ...DEFAULT_PRESETS[presetId]
  };
}

/**
 * Sauvegarde le preset actif pour la pièce en cours.
 *
 * @param {string} presetId - ID du preset à sauvegarder (ex: "arche")
 * @param {string} playId - ID de la pièce (requis si connecté)
 * @returns {Promise<void>}
 */
export async function saveActivePreset(presetId, playId = null) {
  if (!DEFAULT_PRESETS[presetId]) {
    console.error('saveActivePreset: preset invalide', presetId);
    return;
  }

  if (authService.isAuthenticated() && playId) {
    // User connecté : sauvegarder en BDD
    try {
      await playsService.renamePlay(playId, { preset_id: presetId });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du preset en BDD:', error);
      throw error;
    }
  } else {
    // User invité : sauvegarder en localStorage
    localStorage.setItem(GUEST_PRESET_KEY, presetId);
  }
}

/**
 * Liste tous les presets disponibles (pour l'UI de sélection).
 *
 * @returns {Array<Object>} Liste des presets avec leur ID
 */
export function listPresets() {
  return Object.entries(DEFAULT_PRESETS).map(([id, preset]) => ({
    id,
    ...preset
  }));
}

/**
 * Récupère un preset par son ID.
 *
 * @param {string} presetId - ID du preset
 * @returns {Object|null} Le preset ou null si non trouvé
 */
export function getPreset(presetId) {
  if (!DEFAULT_PRESETS[presetId]) {
    return null;
  }

  return {
    id: presetId,
    ...DEFAULT_PRESETS[presetId]
  };
}

/**
 * Export par défaut - Service de gestion des presets
 */
export const templateService = {
  applyPreset,
  getActivePreset,
  saveActivePreset,
  listPresets,
  getPreset
};

export default templateService;
