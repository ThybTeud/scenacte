import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, Decoration, ViewPlugin, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { RangeSetBuilder } from '@codemirror/state';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayParser, astToHTML } from '@/utils/playParser';
import ShadowPreview from '@/components/editors/ShadowPreview';
import { shadowPreviewCSS } from '@/utils/shadowPreview';

const DEMO_TEXT = `#Acte I
##Scène 1
(Un salon, fin d'après-midi. La lumière décline.)
@ALICE
(hésitante) Tu crois qu'on peut encore (elle regarde la fenêtre) changer quelque chose ?
(Un silence.)
@THOMAS
Peut-être. Mais pas ce soir.`;

/**
 * Creates a lightweight CodeMirror play extension (highlighting only, no autocomplete)
 */
function createPlayHighlighter() {
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
      fontSize: '13px',
      fontFamily: '"Source Code Pro", "Fira Code", ui-monospace, monospace',
      backgroundColor: '#ffffff',
    },
    '.cm-scroller': { overflow: 'auto', fontFamily: 'inherit' },
    '.cm-content': { padding: '16px', paddingLeft: '0', minHeight: '100%' },
    '.cm-line': { padding: '0 4px', lineHeight: '1.6' },
    '.cm-gutters': {
      backgroundColor: '#fafafa',
      color: '#9ca3af',
      borderRight: '1px solid #e5e5e5',
    },
    '.cm-act': { color: 'oklch(58.6% 0.253 17.585)', fontWeight: '600' },
    '.cm-scene': { color: 'oklch(58.6% 0.253 17.585)', fontWeight: '600' },
    '.cm-character': { color: 'oklch(54.6% 0.245 262.881)', fontWeight: '600' },
    '.cm-didascalie': { color: 'oklch(44.6% 0.03 256.802)', fontStyle: 'italic' },
    '.cm-didascalie-inline': { color: 'oklch(44.6% 0.03 256.802)', fontStyle: 'italic' },
    '&.cm-focused': { outline: 'none' },
  })];
}

const parser = new PlayParser();

export default function DemoSection() {
  const [content, setContent] = useState(DEMO_TEXT);
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimatedRef = useRef(false);

  // Parse content to HTML for preview
  const previewHTML = useMemo(() => {
    const ast = parser.parse(content);
    return astToHTML(ast);
  }, [content]);

  // Intersection Observer to detect visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Initialize CodeMirror when visible
  useEffect(() => {
    if (!isVisible || !editorRef.current || viewRef.current) return;

    const extensions = createPlayHighlighter();

    const startState = EditorState.create({
      doc: DEMO_TEXT,
      extensions: [
        lineNumbers(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        ...extensions,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setContent(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Typing animation
    if (!hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      // Set empty doc, then type it character by character
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: '' },
      });

      let i = 0;
      const typeChar = () => {
        if (i < DEMO_TEXT.length && viewRef.current) {
          viewRef.current.dispatch({
            changes: { from: i, to: i, insert: DEMO_TEXT[i] },
          });
          i++;
          const delay = DEMO_TEXT[i - 1] === '\n' ? 120 : 25;
          setTimeout(typeChar, delay);
        }
      };
      setTimeout(typeChar, 400);
    }

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [isVisible]);

  const handleReset = useCallback(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      changes: { from: 0, to: viewRef.current.state.doc.length, insert: DEMO_TEXT },
    });
    setContent(DEMO_TEXT);
  }, []);

  return (
    <section ref={containerRef} className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 text-center font-[Space_Grotesk] text-2xl font-bold text-black sm:text-3xl">
          Essayez par vous-même
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-sm text-black/60 sm:text-base">
          Tapez à gauche avec la syntaxe Scenacte — la mise en forme apparaît à droite en temps réel.
        </p>

        {isVisible ? (
          <div className="rounded-sm border-2 border-black bg-white shadow-brutal-lg overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between border-b-2 border-black bg-cream px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-black bg-primary" />
                <div className="h-3 w-3 rounded-full border-2 border-black bg-yellow-400" />
                <div className="h-3 w-3 rounded-full border-2 border-black bg-green-400" />
                <span className="ml-2 font-mono text-xs text-black/50">démo interactive</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 gap-1.5 text-xs text-black/60 hover:text-black"
              >
                <RotateCcw className="size-3.5" />
                Réinitialiser
              </Button>
            </div>

            {/* Split editor / preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 md:divide-black">
              {/* CodeMirror editor */}
              <div className="h-72 md:h-80 overflow-hidden">
                <div ref={editorRef} className="h-full w-full" />
              </div>

              {/* Preview */}
              <div className="border-t-2 border-black md:border-t-0 h-72 md:h-80 overflow-auto">
                <ShadowPreview
                  css={shadowPreviewCSS}
                  htmlContent={previewHTML}
                  layout="centered"
                  className="h-full p-4 sm:p-6"
                />
              </div>
            </div>
          </div>
        ) : (
          // Placeholder while not visible
          <div className="h-96 rounded-sm border-2 border-black/20 bg-white/50" />
        )}
      </div>
    </section>
  );
}
