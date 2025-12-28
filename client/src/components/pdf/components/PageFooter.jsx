import { Text } from '@react-pdf/renderer';

/**
 * Footer fixe avec numéro de page
 * @param {Object} props
 * @param {Object} props.styles - Styles du template
 */
export function PageFooter({ styles }) {
  return (
    <Text
      style={styles.pageNumber}
      render={({ pageNumber }) => {
        // Page 1 = titre, pas de numéro
        if (pageNumber === 1) return '';
        return `${pageNumber - 1}`;
      }}
      fixed
    />
  );
}
