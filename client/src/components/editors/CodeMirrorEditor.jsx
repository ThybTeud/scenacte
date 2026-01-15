import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { EditorState, RangeSetBuilder } from '@codemirror/state';
import { EditorView, Decoration, ViewPlugin, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, acceptCompletion } from '@codemirror/autocomplete';

// Utilisation d'un mode StreamLanguage pour le surlignage personnalisé (voir createPlayExtension)

/**
 * Composant éditeur CodeMirror pour l'édition de pièces de théâtre
 *
 * @param {Object} props
 * @param {string} props.value - Contenu initial de l'éditeur
 * @param {function} props.onChange - Callback appelé lors des changements (value) => void
 * @param {function} props.onScroll - Callback appelé lors du scroll (scrollInfo) => void
 * @param {React.RefObject} props.scrollSync - Ref pour synchroniser le scroll depuis l'extérieur
 */
export const CodeMirrorEditor = forwardRef(function CodeMirrorEditor({ value = '', onChange, onScroll, onCursorChange, scrollSync, characters = [] }, ref) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const isInternalChangeRef = useRef(false);

  // StateEffect + StateField pour appliquer les décorations ligne (highlights)
  // définis au niveau du module mais utilisés ici.

  /**
   * Crée l'extension personnalisée pour les balises théâtrales
   */
  const createPlayExtension = useCallback(() => {
    // ViewPlugin qui construit des décorations de ligne basées sur des regex simples
    const lineHighlighter = ViewPlugin.fromClass(class {
      constructor(view) {
        this.decorations = this.buildDeco(view);
      }
      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDeco(update.view);
        }
      }
      buildDeco(view) {
        const builder = new RangeSetBuilder();
        const { from, to } = view.viewport; // visible range for performance
        let pos = from;
        while (pos <= to) {
          const line = view.state.doc.lineAt(pos);
          const text = line.text;
          if (/^##\s*/.test(text)) {
            builder.add(line.from, line.from, Decoration.line({ class: 'cm-scene' }));
          } else if (/^#(?!#)\s*/.test(text)) {
            builder.add(line.from, line.from, Decoration.line({ class: 'cm-act' }));
          } else if (/^@\s*/.test(text)) {
            builder.add(line.from, line.from, Decoration.line({ class: 'cm-character' }));
          } else if (/^\([^\)]*\)\s*$/.test(text)) { // Vérifie que l'échappement '\' est nécessaire pour les didascalies.
            builder.add(line.from, line.from, Decoration.line({ class: 'cm-didascalie' }));
          }
          pos = line.to + 1;
        }
        return builder.finish();
      }
    }, { decorations: v => v.decorations });

    return [lineHighlighter, EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '14px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        backgroundColor: '#ffffff'
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'inherit'
      },
      '.cm-content': {
        padding: '16px',
        paddingLeft: '0',
        minHeight: '100%'
      },
      '.cm-line': {
        padding: '0 4px',
        lineHeight: '1.6'
      },
      '.cm-activeLine': {
        backgroundColor: 'oklch(97% 0.014 254.604)'
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'oklch(93% 0.034 272.788)'
      },
      '.cm-gutters': {
        backgroundColor: '#fafafa',
        color: '#9ca3af',
        borderRight: '1px solid #e5e5e5'
      },
      '.cm-tooltip-autocomplete': {
        color: '#000',
        border: '1px solid #d4d4d4',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '6px',
        maxHeight: '260px',
        overflow: 'auto',
        minWidth: '100px',
        zIndex: 50,
        backgroundColor: '#ffffff'
      },
      '.cm-tooltip-autocomplete ul': { listStyle: 'none', margin: 0, padding: 0 },
      '.cm-completion': {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '8px 10px',
        borderRadius: '4px',
        cursor: 'pointer'
      },
      '.cm-tooltip-autocomplete .cm-completionIcon': {
        display: 'none'
      },
      '.cm-completionIcon': {
        display: 'none'
      },
      '.cm-tooltip-autocomplete .cm-completion': {
        paddingLeft: '8px'
      },
      '.cm-completionMatchedText': { textDecoration: 'none' },
      // Classes de surlignage adoucies pour les types de balises
      '.cm-act': {
        color: 'oklch(64.6% 0.222 41.116)',
        fontWeight: '600',
      },
      '.cm-scene': {
        color: 'oklch(64.6% 0.222 41.116)',
        fontWeight: '600',
      },
      '.cm-character': {
        color: 'oklch(54.6% 0.245 262.881)',
        fontWeight: '600',
      },
      '.cm-didascalie': {
        color: 'oklch(44.6% 0.03 256.802)',
        fontStyle: 'italic',
      }
    })];
  }, []);

  // Ref pour que la source d'autocomplétion puisse accéder aux personnages à jour
  const charactersRef = useRef(characters);
  useEffect(() => {
    charactersRef.current = characters;
  }, [characters]);

  /**
   * Crée l'extension d'autocomplétion pour les personnages (trigger sur '@')
   */
  const createCompletionExtension = useCallback(() => {
    const source = (context) => {
      // On cherche un token commençant par @ suivi de lettres/chiffres/_
      const token = context.matchBefore(/^@.*/);
      if (!token) return null;

      // Si rien n'a été saisi après @, on affiche toute la liste
      const query = token.text.slice(1).toUpperCase();

      const chars = charactersRef.current || [];
      const options = chars.map((name) => ({
        label: name,
        type: 'variable',
        apply: name
      })).filter(opt => {
        if (!query) return true;
        return opt.label.toUpperCase().startsWith(query);
      });

      return {
        from: token.from + 1, // on remplace après le '@'
        options
      };
    };

    return autocompletion({ override: [source], activateOnTyping: true });
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
        createCompletionExtension(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          { key: 'Tab', run: acceptCompletion }
        ]),
        // playExtension returns an array [mode, theme]
        ...playExtension,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) {
            isInternalChangeRef.current = true;
            onChange(update.state.doc.toString());
          }

          // Notifier le changement de curseur
          if (update.selectionSet && onCursorChange) {
            const line = update.state.doc.lineAt(update.state.selection.main.head).number - 1;
            onCursorChange(line);
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

    // nothing: StreamLanguage handles inline token highlighting

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
              selection: { anchor: line.to }, // Position à la fin de la ligne
              scrollIntoView: true
            });
            view.focus();
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
    // Si le changement vient de l'intérieur (l'utilisateur qui tape), on ignore
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

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
     * Scroll vers une ligne spécifique et positionne le curseur à la fin
     * @param {number} lineNumber - Le numéro de ligne (1-indexed)
     */
    scrollToLine: (lineNumber) => {
      if (!viewRef.current) return;

      try {
        const line = viewRef.current.state.doc.line(Math.max(1, lineNumber));
        viewRef.current.dispatch({
          selection: { anchor: line.to }, // Position à la fin de la ligne
          scrollIntoView: true
        });
        viewRef.current.focus();
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
    <div className="h-full w-full overflow-hidden border border-gray-200 rounded bg-white">
      <div ref={editorRef} className="h-full w-full" />
    </div>
  );
});
