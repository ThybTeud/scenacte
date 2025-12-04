import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { EditorState, RangeSetBuilder } from '@codemirror/state';
import { EditorView, Decoration, ViewPlugin, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion } from '@codemirror/autocomplete';

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
export const CodeMirrorEditor = forwardRef(function CodeMirrorEditor({ value = '', onChange, onScroll, scrollSync, characters = [] }, ref) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  // StateEffect + StateField pour appliquer les décorations ligne (highlights)
  // définis au niveau du module mais utilisés ici.

  /**
   * Crée l'extension personnalisée pour les balises théâtrales
   * Optimisé avec cache de décorations par ligne et mise à jour incrémentale
   */
  const createPlayExtension = useCallback(() => {
    // ViewPlugin avec cache de décorations par ligne
    const lineHighlighter = ViewPlugin.fromClass(class {
      constructor(view) {
        // Cache des décorations par numéro de ligne
        this.lineCache = new Map();
        this.decorations = this.buildDeco(view);
      }

      /**
       * Détermine la décoration d'une ligne selon son premier caractère
       * Optimisé avec test préliminaire sur le premier caractère
       * @param {string} text - Texte de la ligne
       * @returns {Decoration|null} - Décoration ou null
       */
      getLineDecoration(text) {
        if (!text || text.length === 0) return null;

        // Test préliminaire rapide sur le premier caractère
        const firstChar = text[0];

        if (firstChar === '#') {
          // Scène (##) a priorité sur acte (#)
          if (text.startsWith('##')) {
            return Decoration.line({ class: 'cm-scene' });
          }
          return Decoration.line({ class: 'cm-act' });
        }

        if (firstChar === '@') {
          return Decoration.line({ class: 'cm-character' });
        }

        if (firstChar === '(' && text.endsWith(')')) {
          return Decoration.line({ class: 'cm-didascalie' });
        }

        return null;
      }

      /**
       * Compte le nombre de lignes modifiées
       * @param {ViewUpdate} update
       * @returns {Set<number>} - Set des numéros de lignes modifiées
       */
      getChangedLines(update) {
        const changedLines = new Set();
        update.changes.iterChangedRanges((fromA, toA, fromB, toB) => {
          // Lignes affectées dans le nouveau document
          const startLine = update.state.doc.lineAt(fromB).number;
          const endLine = update.state.doc.lineAt(Math.min(toB, update.state.doc.length)).number;
          for (let i = startLine; i <= endLine; i++) {
            changedLines.add(i);
          }
        });
        return changedLines;
      }

      /**
       * Mise à jour incrémentale des décorations (pour petits changements)
       * @param {ViewUpdate} update
       */
      updateIncrementally(update) {
        const view = update.view;
        const changedLines = this.getChangedLines(update);
        const builder = new RangeSetBuilder();
        const { from, to } = view.viewport;
        let pos = from;

        while (pos <= to) {
          const line = view.state.doc.lineAt(pos);
          const lineNum = line.number;

          let decoration;

          if (changedLines.has(lineNum)) {
            // Ligne modifiée : invalider le cache et recalculer
            this.lineCache.delete(lineNum);
            decoration = this.getLineDecoration(line.text);
            if (decoration !== null) {
              this.lineCache.set(lineNum, decoration);
            }
          } else if (this.lineCache.has(lineNum)) {
            // Ligne non modifiée avec cache valide
            decoration = this.lineCache.get(lineNum);
          } else {
            // Ligne non modifiée sans cache : calculer et mettre en cache
            decoration = this.getLineDecoration(line.text);
            if (decoration !== null) {
              this.lineCache.set(lineNum, decoration);
            }
          }

          if (decoration) {
            builder.add(line.from, line.from, decoration);
          }

          pos = line.to + 1;
        }

        return builder.finish();
      }

      update(update) {
        const docChanged = update.docChanged;
        const viewportChanged = update.viewportChanged;

        // Rien ne change : ne rien faire
        if (!docChanged && !viewportChanged) {
          return;
        }

        if (docChanged) {
          const changedLines = this.getChangedLines(update);

          if (changedLines.size <= 5) {
            // Petit changement : mise à jour incrémentale
            this.decorations = this.updateIncrementally(update);
          } else {
            // Gros changement : rebuild complet (mais garder le cache utile)
            this.decorations = this.buildDeco(update.view);
          }
        } else if (viewportChanged) {
          // Scroll seulement : rebuild mais garder le cache
          this.decorations = this.buildDeco(update.view);
        }
      }

      buildDeco(view) {
        const builder = new RangeSetBuilder();
        const { from, to } = view.viewport;
        let pos = from;

        while (pos <= to) {
          const line = view.state.doc.lineAt(pos);
          const lineNum = line.number;

          let decoration;

          // Utiliser le cache si disponible
          if (this.lineCache.has(lineNum)) {
            decoration = this.lineCache.get(lineNum);
          } else {
            // Calculer et mettre en cache
            decoration = this.getLineDecoration(line.text);
            if (decoration !== null) {
              this.lineCache.set(lineNum, decoration);
            }
          }

          if (decoration) {
            builder.add(line.from, line.from, decoration);
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
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
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
        backgroundColor: '#E8F2FF'
      },
      '.cm-activeLineGutter': {
        backgroundColor: '#e5e7eb'
      },
      '.cm-gutters': {
        backgroundColor: '#f9fafb',
        color: '#9ca3af'
      },
      '.cm-tooltip-autocomplete': {
        color: '#000',
        border: '2px solid #000',
        borderRadius: '4px',
        boxShadow: '3px 3px 0px',
        padding: '6px',
        maxHeight: '260px',
        overflow: 'auto',
        minWidth: '100px',
        zIndex: 50
      },
      '.cm-tooltip-autocomplete ul': { listStyle: 'none', margin: 0, padding: 0 },
      '.cm-completion': {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '8px 10px',
        borderRadius: '6px',
        cursor: 'pointer'
      }
      ,
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
      // Classes de surlignage pour les types de balises (StreamLanguage émettra des tokens cm-scene, cm-act, ...)
      '.cm-act': {
        color: '#fd7e14',
        fontWeight: '700',
      },
      '.cm-scene': {
        color: '#fd7e14',
        fontWeight: '700',
      },
      '.cm-character': {
        color: '#276ef1',
        fontWeight: '700',
      },
      '.cm-didascalie': {
        color: '#a8a8a8',
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
      const token = context.matchBefore(/^@.+/);
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
          ...historyKeymap
        ]),
        // playExtension returns an array [mode, theme]
        ...playExtension,
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
