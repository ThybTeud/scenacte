import { View, Text } from '@react-pdf/renderer';

/**
 * Page de titre du document PDF
 * @param {Object} props
 * @param {string} props.title - Titre de la pièce
 * @param {string} [props.subtitle] - Sous-titre optionnel
 * @param {Object} props.styles - Styles du template
 */
export function TitlePage({ title, subtitle, styles }) {
  return (
    <View style={styles.titlePage}>
      <Text style={styles.titlePageTitle}>{title}</Text>
      {subtitle && (
        <Text style={styles.titlePageSubtitle}>{subtitle}</Text>
      )}
    </View>
  );
}
