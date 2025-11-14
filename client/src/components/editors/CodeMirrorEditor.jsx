import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

/**
 * Composant éditeur CodeMirror pour l'édition de pièces de théâtre
 *
 * @param {Object} props
 * @param {string} props.value - Contenu initial de l'éditeur
 * @param {function} props.onChange - Callback appelé lors des changements (value) => void
 * @param {function} props.onScroll - Callback appelé lors du scroll (scrollInfo) => void
 * @param {React.RefObject} props.scrollSync - Ref pour synchroniser le scroll depuis l'extérieur
 */
export function CodeMirrorEditor({ value = '', onChange, onScroll, scrollSync }) {
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
        keymap.of([
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

    // Exposer la méthode de scroll via la ref
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

  return (
    <div className="h-full w-full overflow-hidden border border-gray-300 rounded-lg bg-white">
      <div ref={editorRef} className="h-full w-full" />
    </div>
  );
}
