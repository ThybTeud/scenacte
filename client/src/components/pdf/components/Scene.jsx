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
  if (typeof node === 'string') return node;
  if (node.content) return node.content;
  if (node.children) {
    return node.children.map(getTextContent).join('');
  }
  return '';
}
