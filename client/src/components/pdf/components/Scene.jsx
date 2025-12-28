import { Text } from '@react-pdf/renderer';

/**
 * Titre de scène
 * @param {Object} props
 * @param {Object} props.node - Nœud AST de la scène
 * @param {Object} props.styles - Styles du template
 */
export function Scene({ node, styles }) {
  const title = getTextContent(node);

  return (
    <Text style={styles.scene}>
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
