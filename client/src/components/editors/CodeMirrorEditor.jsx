import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, memo } from 'react';
import { EditorState, RangeSetBuilder, Transaction } from '@codemirror/state';
import { EditorView, Decoration, ViewPlugin, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, undo, redo, undoDepth, redoDepth } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, acceptCompletion } from '@codemirror/autocomplete';
import { toggleLineFormat } from '@/utils/editorCommands';

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
const CodeMirrorEditorComponent = forwardRef(function CodeMirrorEditor({ value = '', onChange, onScroll, onCursorChange, scrollSync, characters = [] }, ref) {
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
        const { from, to } = view.viewport;
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
          } else if (/^\([^)]*\)\s*$/.test(text)) {
            builder.add(line.from, line.from, Decoration.line({ class: 'cm-didascalie' }));
          } else {
            // Chercher les (...) inline dans la ligne
            const regex = /\([^)]+\)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
              builder.add(
                line.from + match.index,
                line.from + match.index + match[0].length,
                Decoration.mark({ class: 'cm-didascalie-inline' })
              );
            }
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
        paddingBottom: '30vh',
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
        color: 'oklch(58.6% 0.253 17.585)',
        fontWeight: '600',
      },
      '.cm-scene': {
        color: 'oklch(58.6% 0.253 17.585)',
        fontWeight: '600',
      },
      '.cm-character': {
        color: 'oklch(54.6% 0.245 262.881)',
        fontWeight: '600',
      },
      '.cm-didascalie': {
        color: 'oklch(44.6% 0.03 256.802)',
        fontStyle: 'italic',
      },
      '.cm-didascalie-inline': {
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
            const newValue = update.state.doc.toString();
            lastValueRef.current = newValue;
            onChange(newValue);
          }

          // Notifier le changement de curseur
          if (update.selectionSet && onCursorChange) {
            const line = update.state.doc.lineAt(update.state.selection.main.head).number - 1;
            onCursorChange(line);
          }

          // Notifier le scroll avec la première ligne visible (0-indexed)
          if (update.view.scrollDOM && onScroll) {
            const scrollDOM = update.view.scrollDOM;
            const topPos = update.view.lineBlockAtHeight(scrollDOM.scrollTop).from;
            const firstVisibleLine = update.view.state.doc.lineAt(topPos).number - 1;
            onScroll({ firstVisibleLine });
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
   * Garde une référence de la dernière valeur pour détecter les changements externes
   */
  const lastValueRef = useRef(value);

  /**
   * Met à jour le contenu de l'éditeur UNIQUEMENT lors du montage initial
   * Les mises à jour ultérieures doivent passer par la méthode setValue() exposée via ref
   */
  useEffect(() => {
    // Si le changement vient de l'intérieur (l'utilisateur qui tape), on ignore
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      lastValueRef.current = value;
      return;
    }

    if (!viewRef.current) return;

    const currentValue = viewRef.current.state.doc.toString();

    // Si la valeur externe a changé ET qu'elle est différente du contenu actuel
    // ET qu'elle n'est pas le résultat d'un onChange (lastValueRef)
    if (value !== lastValueRef.current && value !== currentValue) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value
        },
        annotations: Transaction.addToHistory.of(false)
      });
    }

    lastValueRef.current = value;
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
     * Annule la dernière modification
     * @returns {boolean} - true si l'annulation a été effectuée
     */
    undo: () => {
      if (!viewRef.current) return false;
      return undo(viewRef.current);
    },

    /**
     * Rétablit la dernière modification annulée
     * @returns {boolean} - true si le rétablissement a été effectué
     */
    redo: () => {
      if (!viewRef.current) return false;
      return redo(viewRef.current);
    },

    /**
     * Vérifie si l'annulation est possible
     * @returns {boolean} - true si l'annulation est possible
     */
    canUndo: () => {
      if (!viewRef.current) return false;
      return undoDepth(viewRef.current.state) > 0;
    },

    /**
     * Vérifie si le rétablissement est possible
     * @returns {boolean} - true si le rétablissement est possible
     */
    canRedo: () => {
      if (!viewRef.current) return false;
      return redoDepth(viewRef.current.state) > 0;
    },

    /**
     * Toggle un format de ligne (acte/scène, personnage, didascalie, dialogue)
     * @param {string} formatType - Le type de format : 'heading', 'personnage', 'didascalie', 'dialogue'
     */
    toggleLineFormat: (formatType) => {
      toggleLineFormat(viewRef.current, formatType);
    }
  }), []);

  return (
    <div className="h-full w-full overflow-hidden">
      <div ref={editorRef} className="h-full w-full" />
    </div>
  );
});

// Mémoïser le composant pour éviter les re-renders inutiles
// On compare seulement 'value' et 'characters' car ce sont les props qui changent fréquemment
export const CodeMirrorEditor = memo(CodeMirrorEditorComponent, (prevProps, nextProps) => {
  // Ne re-render que si value ou characters ont vraiment changé
  return prevProps.value === nextProps.value &&
         prevProps.characters === nextProps.characters;
});
