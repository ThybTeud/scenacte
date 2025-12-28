import { Text } from '@react-pdf/renderer';

/**
 * Nom du personnage qui parle
 * @param {Object} props
 * @param {Object} props.node - Nœud AST du personnage
 * @param {Object} props.styles - Styles du template
 */
export function Character({ node, styles }) {
  const name = getTextContent(node);

  return (
    <Text style={styles.character}>
      {name}
    </Text>
  );
}

/**
 * Extrait le contenu textuel d'un nœud AST
 */
function getTextContent(node) {
  if (!node) return '';
  // AST Scenacte : le nom est dans node.attributes.name
  if (node.attributes?.name) return node.attributes.name;
  if (node.name) return node.name;
  return '';
}
