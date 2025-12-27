import './registerFonts';
import { Document, Page, View } from '@react-pdf/renderer';
import { getStyles } from './PdfStyles';
import {
  TitlePage,
  Act,
  Scene,
  Character,
  Dialogue,
  StageDirection,
  PageFooter,
} from './components';

/**
 * Document PDF principal pour l'export de pièces de théâtre
 *
 * @param {Object} props
 * @param {Object} props.ast - AST généré par le parser Scenacte
 * @param {string} props.title - Titre de la pièce
 * @param {string} [props.subtitle] - Sous-titre optionnel
 * @param {string} [props.template='classic'] - Template de style ('classic' | 'modern' | 'minimal')
 * @param {string} [props.pageFormat='A4'] - Format de page ('A4' | 'A5' | 'LETTER')
 */
export function PdfDocument({
  ast,
  title,
  subtitle,
  template = 'classic',
  pageFormat = 'A4',
}) {
  const styles = getStyles(template, pageFormat);

  console.log('=== PdfDocument render ===');
  console.log('AST reçu dans PdfDocument:', ast);
  console.log('Template:', template, 'Format:', pageFormat);

  return (
    <Document
      title={title}
      author="Scenacte"
      creator="Scenacte"
      producer="Scenacte - react-pdf"
    >
      {/* Page de titre */}
      <Page size={pageFormat} style={styles.page}>
        <TitlePage title={title} subtitle={subtitle} styles={styles} />
      </Page>

      {/* Contenu de la pièce avec pagination automatique */}
      <Page size={pageFormat} style={styles.page} wrap>
        <PageFooter styles={styles} />
        <View>
          {console.log('Avant appel renderAstContent')}
          {renderAstContent(ast, styles)}
        </View>
      </Page>
    </Document>
  );
}

/**
 * Transforme l'AST en composants React-PDF
 *
 * @param {Object} ast - AST racine
 * @param {Object} styles - Styles du template
 * @returns {React.ReactNode[]} Composants React-PDF
 */
function renderAstContent(ast, styles) {
  console.log('=== renderAstContent appelé ===');
  console.log('AST reçu:', ast);
  console.log('AST.children:', ast?.children);

  if (!ast || !ast.children || ast.children.length === 0) {
    console.warn('AST vide ou invalide');
    return null;
  }

  console.log('Nombre d\'enfants:', ast.children.length);

  // Contexte partagé pour tracker l'index des actes
  const context = { actIndex: 0 };

  const elements = ast.children.map((node, index) => {
    console.log(`Traitement nœud ${index}:`, node.type, node);
    const element = renderNode(node, index, styles, context);
    console.log(`Élément généré pour ${node.type}:`, element);
    // Incrémenter actIndex seulement pour les actes
    if (node.type === 'acte') {
      context.actIndex++;
    }
    return element;
  });

  console.log('Éléments générés:', elements);
  return elements;
}

/**
 * Rend un nœud AST en composant React-PDF approprié
 *
 * @param {Object} node - Nœud AST
 * @param {number} index - Index pour la clé React
 * @param {Object} styles - Styles du template
 * @param {Object} context - Contexte de rendu (actIndex, etc.)
 * @returns {React.ReactNode} Composant React-PDF
 */
function renderNode(node, index, styles, context = {}) {
  console.log(`renderNode appelé - type: ${node?.type}, index: ${index}`);

  if (!node) {
    console.warn('Node est null/undefined');
    return null;
  }

  const key = node.id || `node-${index}`;

  switch (node.type) {
    case 'acte':
      return (
        <View key={key}>
          <Act
            node={node}
            styles={styles}
            isFirst={context.actIndex === 0}
          />
          {node.children && renderChildren(node.children, styles)}
        </View>
      );

    case 'scene':
      return (
        <View key={key}>
          <Scene node={node} styles={styles} />
          {node.children && renderChildren(node.children, styles)}
        </View>
      );

    case 'personnage':
      return (
        <View key={key}>
          <Character node={node} styles={styles} />
          {node.children && renderChildren(node.children, styles)}
        </View>
      );

    case 'dialogue':
      return (
        <Dialogue key={key} node={node} styles={styles} />
      );

    case 'didascalie':
      return (
        <StageDirection key={key} node={node} styles={styles} />
      );

    case 'text':
    case 'paragraph':
      // Texte simple, rendu comme dialogue par défaut
      return (
        <Dialogue key={key} node={node} styles={styles} />
      );

    default:
      // Pour les types non reconnus, tenter de rendre les enfants
      if (node.children) {
        return (
          <View key={key}>
            {renderChildren(node.children, styles)}
          </View>
        );
      }
      console.warn(`Type de nœud non géré: ${node.type}`);
      return null;
  }
}

/**
 * Rend les enfants d'un nœud AST
 *
 * @param {Array} children - Tableau de nœuds enfants
 * @param {Object} styles - Styles du template
 * @returns {React.ReactNode[]} Composants React-PDF
 */
function renderChildren(children, styles) {
  if (!Array.isArray(children)) return null;

  return children.map((child, index) => {
    return renderNode(child, index, styles);
  });
}

/**
 * Version avec groupement personnage + dialogues pour éviter les orphelins
 * Utilisable pour une optimisation future
 *
 * @param {Array} children - Nœuds enfants d'une scène
 * @param {Object} styles - Styles du template
 * @returns {React.ReactNode[]} Composants groupés
 */
function renderGroupedContent(children, styles) {
  if (!Array.isArray(children)) return null;

  const groups = [];
  let currentGroup = null;

  children.forEach((node, index) => {
    if (node.type === 'character') {
      // Nouveau groupe : personnage + ses dialogues
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        character: node,
        dialogues: [],
        key: node.id || `group-${index}`,
      };
    } else if (node.type === 'dialogue' && currentGroup) {
      currentGroup.dialogues.push(node);
    } else {
      // Élément hors groupe (didascalie, etc.)
      if (currentGroup) {
        groups.push(currentGroup);
        currentGroup = null;
      }
      groups.push({ standalone: node, key: node.id || `standalone-${index}` });
    }
  });

  // Ajouter le dernier groupe
  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups.map((group) => {
    if (group.standalone) {
      return renderNode(group.standalone, 0, styles);
    }

    // Groupe personnage + dialogues avec wrap={false} pour éviter les orphelins
    return (
      <View key={group.key} style={styles.characterGroup} wrap={false}>
        <Character node={group.character} styles={styles} />
        {group.dialogues.map((dialogue, i) => (
          <Dialogue
            key={dialogue.id || `dialogue-${i}`}
            node={dialogue}
            styles={styles}
          />
        ))}
      </View>
    );
  });
}

export default PdfDocument;
