import { Text } from '@react-pdf/renderer';
import { getTextContent } from '../utils/getTextContent';

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
