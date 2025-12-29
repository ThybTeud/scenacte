import { Text } from '@react-pdf/renderer';
import { getTextContent } from '../utils/getTextContent';

/**
 * Titre d'acte avec saut de page automatique
 * @param {Object} props
 * @param {Object} props.node - Nœud AST de l'acte
 * @param {Object} props.styles - Styles du template
 * @param {boolean} [props.isFirst=false] - Si c'est le premier acte (pas de saut de page)
 */
export function Act({ node, styles, isFirst = false }) {
  const title = getTextContent(node);

  return (
    <Text
      style={styles.act}
      break={!isFirst} // Saut de page sauf pour le premier acte
    >
      {title}
    </Text>
  );
}
