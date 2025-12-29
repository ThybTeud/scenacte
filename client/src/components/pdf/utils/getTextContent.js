/**
 * Extrait le contenu textuel d'un nœud AST Scenacte
 *
 * Gère différentes structures de nœuds AST :
 * - node.value : contenu textuel direct
 * - node.content : contenu alternatif
 * - node.attributes.name : nom de personnage
 * - node.attributes.number : numéro d'acte/scène
 *
 * @param {Object} node - Nœud AST
 * @returns {string} Contenu textuel extrait
 */
export function getTextContent(node) {
  if (!node) return '';

  // Texte direct dans node.value
  if (node.value) return node.value;

  // Texte alternatif dans node.content
  if (node.content) return node.content;

  // Attributs spécifiques
  if (node.attributes?.name) return node.attributes.name;
  if (node.attributes?.number) return node.attributes.number;

  return '';
}
