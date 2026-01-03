/**
 * Utilitaires de commandes pour l'éditeur CodeMirror
 * Gère les transformations de format de lignes pour les pièces de théâtre
 */

/**
 * Toggle un format de ligne (acte/scène, personnage, didascalie, dialogue)
 *
 * @param {EditorView} view - L'instance de la vue CodeMirror
 * @param {string} formatType - Le type de format à appliquer
 *   - 'heading': Cycle entre rien → # → ## → rien
 *   - 'personnage': Toggle @ au début
 *   - 'didascalie': Toggle parenthèses autour du texte
 *   - 'dialogue': Enlève toutes les balises
 */
export function toggleLineFormat(view, formatType) {
  if (!view) return;

  const selection = view.state.selection.main;
  const line = view.state.doc.lineAt(selection.from);
  const lineText = line.text;

  let newText = lineText;

  switch (formatType) {
    case 'heading': {
      // Cycle : rien → # → ## → rien
      if (lineText.startsWith('##')) {
        // Enlever ##
        newText = lineText.slice(2).trimStart();
      } else if (lineText.startsWith('#')) {
        // # → ##
        newText = '#' + lineText;
      } else {
        // Enlever autres balises d'abord, puis ajouter #
        let cleanText = lineText;
        // Enlever @ au début
        if (cleanText.startsWith('@')) {
          cleanText = cleanText.slice(1);
        }
        // Enlever () autour
        if (cleanText.startsWith('(') && cleanText.endsWith(')')) {
          cleanText = cleanText.slice(1, -1);
        }
        cleanText = cleanText.trim();
        newText = '#' + cleanText;
      }
      break;
    }

    case 'personnage': {
      // Toggle : rien ↔ @
      if (lineText.startsWith('@')) {
        // Enlever @
        newText = lineText.slice(1);
      } else {
        // Enlever autres balises d'abord, puis ajouter @
        let cleanText = lineText;
        // Enlever # ou ##
        if (cleanText.startsWith('##')) {
          cleanText = cleanText.slice(2);
        } else if (cleanText.startsWith('#')) {
          cleanText = cleanText.slice(1);
        }
        // Enlever () autour
        if (cleanText.startsWith('(') && cleanText.endsWith(')')) {
          cleanText = cleanText.slice(1, -1);
        }
        cleanText = cleanText.trim();
        newText = '@' + cleanText;
      }
      break;
    }

    case 'didascalie': {
      // Toggle : rien ↔ (...)
      if (lineText.startsWith('(') && lineText.endsWith(')')) {
        // Enlever ()
        newText = lineText.slice(1, -1);
      } else {
        // Enlever autres balises d'abord, puis entourer avec ()
        let cleanText = lineText;
        // Enlever # ou ##
        if (cleanText.startsWith('##')) {
          cleanText = cleanText.slice(2);
        } else if (cleanText.startsWith('#')) {
          cleanText = cleanText.slice(1);
        }
        // Enlever @ au début
        if (cleanText.startsWith('@')) {
          cleanText = cleanText.slice(1);
        }
        cleanText = cleanText.trim();
        newText = '(' + cleanText + ')';
      }
      break;
    }

    case 'dialogue': {
      // Enlever toutes les balises pour avoir une ligne de dialogue pur
      let cleanText = lineText;
      // Enlever # ou ##
      if (cleanText.startsWith('##')) {
        cleanText = cleanText.slice(2);
      } else if (cleanText.startsWith('#')) {
        cleanText = cleanText.slice(1);
      }
      // Enlever @ au début
      if (cleanText.startsWith('@')) {
        cleanText = cleanText.slice(1);
      }
      // Enlever () autour
      if (cleanText.startsWith('(') && cleanText.endsWith(')')) {
        cleanText = cleanText.slice(1, -1);
      }
      newText = cleanText.trim();
      break;
    }

    default:
      return;
  }

  // Appliquer la modification
  view.dispatch({
    changes: {
      from: line.from,
      to: line.to,
      insert: newText
    },
    selection: {
      anchor: line.from + newText.length
    },
    scrollIntoView: true
  });

  // Focus l'éditeur après modification
  view.focus();
}
