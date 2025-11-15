import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';

/**
 * Composant éditeur CodeMirror pour l'édition de pièces de théâtre
 *
 * @param {Object} props
 * @param {string} props.value - Contenu initial de l'éditeur
 * @param {function} props.onChange - Callback appelé lors des changements (value) => void
 * @param {function} props.onScroll - Callback appelé lors du scroll (scrollInfo) => void
 * @param {React.RefObject} props.scrollSync - Ref pour synchroniser le scroll depuis l'extérieur
 */
export const CodeMirrorEditor = forwardRef(function CodeMirrorEditor({ value = '', onChange, onScroll, scrollSync }, ref) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  /**
   * Crée l'extension personnalisée pour les balises théâtrales
   */
  const createPlayExtension = useCallback(() => {
    return EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '14px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'inherit'
      },
      '.cm-content': {
        padding: '16px',
        minHeight: '100%'
      },
      '.cm-line': {
        padding: '0 4px',
        lineHeight: '1.6'
      },
      '.cm-activeLine': {
        backgroundColor: '#f3f4f6'
      },
      '.cm-activeLineGutter': {
        backgroundColor: '#e5e7eb'
      },
      '.cm-gutters': {
        backgroundColor: '#f9fafb',
        color: '#9ca3af',
        border: 'none'
      }
    });
  }, []);

  /**
   * Initialise l'éditeur CodeMirror
   */
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const playExtension = createPlayExtension();

    // Configuration de l'état initial
    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        syntaxHighlighting(defaultHighlightStyle),
        closeBrackets(), // Autoclose des parenthèses
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap
        ]),
        playExtension,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) {
            onChange(update.state.doc.toString());
          }

          // Notifier le scroll
          if (update.view.scrollDOM && onScroll) {
            const scrollDOM = update.view.scrollDOM;
            const scrollInfo = {
              top: scrollDOM.scrollTop,
              height: scrollDOM.scrollHeight,
              clientHeight: scrollDOM.clientHeight,
              percentage: scrollDOM.scrollTop / (scrollDOM.scrollHeight - scrollDOM.clientHeight)
            };
            onScroll(scrollInfo);
          }
        }),
        EditorView.lineWrapping // Active le retour à la ligne automatique
      ]
    });

    // Créer la vue de l'éditeur
    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    // Exposer la méthode de scroll via la ref (pour compatibilité)
    if (scrollSync) {
      scrollSync.current = {
        scrollToPercentage: (percentage) => {
          const scrollDOM = view.scrollDOM;
          if (scrollDOM && !isNaN(percentage)) {
            const scrollHeight = scrollDOM.scrollHeight - scrollDOM.clientHeight;
            scrollDOM.scrollTop = scrollHeight * percentage;
          }
        },
        getScrollPercentage: () => {
          const scrollDOM = view.scrollDOM;
          if (scrollDOM) {
            const scrollHeight = scrollDOM.scrollHeight - scrollDOM.clientHeight;
            return scrollHeight > 0 ? scrollDOM.scrollTop / scrollHeight : 0;
          }
          return 0;
        },
        scrollToLine: (lineNumber) => {
          if (!view) return;
          try {
            const line = view.state.doc.line(Math.max(1, lineNumber));
            view.dispatch({
              selection: { anchor: line.from },
              scrollIntoView: true
            });
          } catch (error) {
            console.error('Error scrolling to line:', error);
          }
        }
      };
    }

    // Cleanup
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Met à jour le contenu de l'éditeur lorsque la valeur change de l'extérieur
   */
  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (value !== currentValue) {
        const transaction = viewRef.current.state.update({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value
          }
        });
        viewRef.current.dispatch(transaction);
      }
    }
  }, [value]);

  /**
   * Expose les méthodes via la ref
   */
  useImperativeHandle(ref, () => ({
    /**
     * Insère du texte à la position actuelle du curseur
     * @param {string} text - Le texte à insérer
     */
    insertText: (text) => {
      if (!viewRef.current) return;

      const view = viewRef.current;
      const selection = view.state.selection.main;

      // Insérer au début de la ligne contenant le curseur
      const line = view.state.doc.lineAt(selection.from);
      const insertPos = line.from;

      view.dispatch({
        changes: {
          from: insertPos,
          to: insertPos,
          insert: text
        },
        // Garder le curseur à sa position logique initiale :
        // on décale l'ancre de la sélection de la longueur du texte inséré
        selection: {
          anchor: selection.from + text.length
        },
        scrollIntoView: true
      });

      // Focus l'éditeur après insertion
      view.focus();
    },

    /**
     * Scroll vers une ligne spécifique
     * @param {number} lineNumber - Le numéro de ligne (1-indexed)
     */
    scrollToLine: (lineNumber) => {
      if (!viewRef.current) return;

      try {
        const line = viewRef.current.state.doc.line(Math.max(1, lineNumber));
        viewRef.current.dispatch({
          selection: { anchor: line.from },
          scrollIntoView: true
        });
      } catch (error) {
        console.error('Error scrolling to line:', error);
      }
    },

    /**
     * Focus l'éditeur
     */
    focus: () => {
      if (viewRef.current) {
        viewRef.current.focus();
      }
    },

    /**
     * Toggle un format de ligne (acte/scène, personnage, didascalie, dialogue)
     * @param {string} formatType - Le type de format : 'heading', 'personnage', 'didascalie', 'dialogue'
     */
    toggleLineFormat: (formatType) => {
      if (!viewRef.current) return;

      const view = viewRef.current;
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
  }), []);

  return (
    <div className="h-full w-full overflow-hidden border border-gray-300 rounded-lg bg-white">
      <div ref={editorRef} className="h-full w-full" />
    </div>
  );
});
