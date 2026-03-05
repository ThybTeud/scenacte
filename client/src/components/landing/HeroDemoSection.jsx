import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EditorState } from '@codemirror/state';
import { EditorView, Decoration, ViewPlugin, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { RangeSetBuilder } from '@codemirror/state';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
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
      backgroundColor: 'transparent',
    },
    '.cm-scroller': { overflow: 'auto', fontFamily: 'inherit' },
    '.cm-content': { padding: '16px', paddingLeft: '0', minHeight: '100%' },
    '.cm-line': { padding: '0 4px', lineHeight: '1.6' },
    '.cm-gutters': {
      backgroundColor: 'hsl(0 0% 98%)',
      color: '#9ca3af',
      borderRight: '1px solid hsl(0 0% 90%)',
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

export default function HeroDemoSection() {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState(DEMO_TEXT);
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  const previewHTML = useMemo(() => {
    const ast = parser.parse(content);
    return astToHTML(ast);
  }, [content]);

  // Initialize CodeMirror on mount
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

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

    // Typing animation on mount
    if (!hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
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
  }, []);

  const handleReset = useCallback(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      changes: { from: 0, to: viewRef.current.state.doc.length, insert: DEMO_TEXT },
    });
    setContent(DEMO_TEXT);
  }, []);

  return (
    <section className="px-4 pt-28 pb-16 sm:px-6 md:pt-36 md:pb-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Hero text */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-[Space_Grotesk] text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            L'éditeur pensé pour{' '}
            <span className="text-primary">l'écriture théâtrale.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Scenacte est le premier éditeur dédié à l'écriture dramatique en français.
            Syntaxe simplifiée, mise en page automatique, export PDF professionnel.
          </p>

          <div className="mt-10">
            {isAuthenticated ? (
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active">
                <Link to="/library">
                  Aller à ma bibliothèque
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active">
                <Link to="/register">
                  Créer ma première pièce
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Interactive demo */}
        <div className="mt-14">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Tapez à gauche avec la syntaxe Scenacte — la mise en forme apparaît à droite en temps réel.
          </p>

          <div className="overflow-hidden rounded-sm border-2 border-border bg-card shadow-brutal-lg">
            {/* Title bar */}
            <div className="flex items-center justify-between border-b-2 border-border bg-muted px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-border bg-primary" />
                <div className="h-3 w-3 rounded-full border-2 border-border bg-yellow-400" />
                <div className="h-3 w-3 rounded-full border-2 border-border bg-green-400" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">démo interactive</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                Réinitialiser
              </Button>
            </div>

            {/* Split editor / preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 md:divide-border">
              {/* CodeMirror editor */}
              <div className="h-72 overflow-hidden md:h-80">
                <div ref={editorRef} className="h-full w-full" />
              </div>

              {/* Preview */}
              <div className="h-72 overflow-auto border-t-2 border-border md:h-80 md:border-t-0">
                <ShadowPreview
                  css={shadowPreviewCSS}
                  htmlContent={previewHTML}
                  layout="centered"
                  className="h-full p-4 sm:p-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
