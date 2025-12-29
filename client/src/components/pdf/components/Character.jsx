import { Text } from '@react-pdf/renderer';
import { getTextContent } from '../utils/getTextContent';

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
