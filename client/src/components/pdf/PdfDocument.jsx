import "./registerFonts";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { getStyles } from "./PdfStyles";
import {
    TitlePage,
    Act,
    Scene,
    Character,
    Dialogue,
    StageDirection,
} from "./components";

/**
 * Document PDF principal pour l'export de pièces de théâtre
 *
 * @param {Object} props
 * @param {Object} props.ast - AST généré par le parser Scenacte
 * @param {string} props.title - Titre de la pièce
 * @param {string} [props.subtitle] - Sous-titre optionnel
 * @param {string} [props.template='classic'] - Template de style ('classic' | 'modern' | 'minimal')
 * @param {string} [props.pageFormat='A4'] - Format de page ('A4' | 'LETTER')
 */
export function PdfDocument({
    ast,
    title,
    subtitle,
    template = "classic",
    pageFormat = "A4",
}) {
    const styles = getStyles(template, pageFormat);

    return (
        <Document
            title={title}
            author="Scenacte"
            creator="Scenacte"
            producer="Scenacte - react-pdf"
        >
            {/* Page de titre */}
            <Page size={pageFormat} style={styles.page} wrap>
                <TitlePage title={title} subtitle={subtitle} styles={styles} />
            
                {/* Contenu principal */}
                <View style={styles.content}>
                    {renderAstContent(ast, styles)}
                </View>

                {/* Footer - numéro de page fixe */}
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                    fixed
                />
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
    if (!ast || !ast.children || ast.children.length === 0) {
        return null;
    }

    // Contexte partagé pour tracker l'index des actes
    const context = { actIndex: 0 };

    const elements = ast.children.map((node, index) => {
        const element = renderNode(node, index, styles, context);
        // Incrémenter actIndex seulement pour les actes
        if (node.type === "acte") {
            context.actIndex++;
        }
        return element;
    });

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
    if (!node) {
        return null;
    }

    const key = node.id || `node-${index}`;

    switch (node.type) {
        case "acte":
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

        case "scene":
            return (
                <View key={key}>
                    <Scene node={node} styles={styles} />
                    {node.children && renderChildren(node.children, styles)}
                </View>
            );

        case "personnage":
            return (
                <View key={key}>
                    <Character node={node} styles={styles} />
                    {node.children && renderChildren(node.children, styles)}
                </View>
            );

        case "dialogue":
            return <Dialogue key={key} node={node} styles={styles} />;

        case "didascalie":
            return <StageDirection key={key} node={node} styles={styles} />;

        case "text":
        case "paragraph":
            // Texte simple, rendu comme dialogue par défaut
            return <Dialogue key={key} node={node} styles={styles} />;

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

export default PdfDocument;
