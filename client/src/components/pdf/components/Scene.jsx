import { Text } from '@react-pdf/renderer';
import { getTextContent } from '../utils/getTextContent';

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
