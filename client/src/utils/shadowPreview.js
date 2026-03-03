/**
 * Utilitaires CSS pour le rendu Shadow DOM (ShadowPreview)
 */

import baseCSS from '../assets/styles/scenacte-template.css?inline';

/**
 * Adapte un CSS pour le rendu dans un Shadow DOM :
 * - :root / body → :host
 * - visibility: hidden supprimé (réservé à PagedJS)
 */
export function adaptForShadow(raw) {
  return raw
    .replace(/visibility\s*:\s*hidden\s*;?\s*/g, '')
    .replace(/:root\s*\{/g, ':host {')
    .replace(/\bbody\s*\{/g, ':host {');
}

export const shadowPreviewCSS = adaptForShadow(baseCSS);
