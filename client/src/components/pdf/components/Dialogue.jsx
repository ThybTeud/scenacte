import { Text } from '@react-pdf/renderer';

/**
 * Réplique d'un personnage
 * @param {Object} props
 * @param {Object} props.node - Nœud AST du dialogue
 * @param {Object} props.styles - Styles du template
 */
export function Dialogue({ node, styles }) {
  const text = getTextContent(node);

  return (
    <Text style={styles.dialogue}>
      {text}
    </Text>
  );
}

/**
 * Extrait le contenu textuel d'un nœud AST
 */
function getTextContent(node) {
  if (!node) return '';
  // AST Scenacte : le texte est dans node.value
  if (node.value) return node.value;
  if (node.content) return node.content;
  return '';
}
