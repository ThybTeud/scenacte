import { Text } from '@react-pdf/renderer';

/**
 * Didascalie (indication scénique)
 * @param {Object} props
 * @param {Object} props.node - Nœud AST de la didascalie
 * @param {Object} props.styles - Styles du template
 */
export function StageDirection({ node, styles }) {
  const text = getTextContent(node);

  return (
    <Text style={styles.stageDirection}>
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
