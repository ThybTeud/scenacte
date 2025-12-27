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
  if (typeof node === 'string') return node;
  if (node.content) return node.content;
  if (node.children) {
    return node.children.map(getTextContent).join('');
  }
  return '';
}
