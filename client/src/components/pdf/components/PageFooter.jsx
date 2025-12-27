import { Text } from '@react-pdf/renderer';

/**
 * Footer fixe avec numéro de page
 * Affiché sur toutes les pages sauf la page de titre
 * @param {Object} props
 * @param {Object} props.styles - Styles du template
 */
export function PageFooter({ styles }) {
  return (
    <Text
      style={styles.pageFooter}
      render={({ pageNumber, totalPages }) =>
        pageNumber > 1 ? `${pageNumber - 1}` : ''
      }
      fixed
    />
  );
}
