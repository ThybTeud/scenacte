import { Text } from '@react-pdf/renderer';
import { getTextContent } from '../utils/getTextContent';

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
