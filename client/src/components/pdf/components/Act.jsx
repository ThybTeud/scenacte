import { Text } from '@react-pdf/renderer';

/**
 * Titre d'acte avec saut de page automatique
 * @param {Object} props
 * @param {Object} props.node - Nœud AST de l'acte
 * @param {Object} props.styles - Styles du template
 * @param {boolean} [props.isFirst=false] - Si c'est le premier acte (pas de saut de page)
 */
export function Act({ node, styles, isFirst = false }) {
  // Extraire le texte du titre depuis le nœud AST
  const title = getTextContent(node);

  return (
    <Text
      style={styles.act}
      break={!isFirst} // Saut de page sauf pour le premier acte
    >
      {title}
    </Text>
  );
}

/**
 * Extrait le contenu textuel d'un nœud AST
 */
function getTextContent(node) {
  if (!node) return '';
  // AST Scenacte : le titre est dans node.value ou node.attributes.number
  if (node.value) return node.value;
  if (node.attributes?.number) return node.attributes.number;
  return '';
}
