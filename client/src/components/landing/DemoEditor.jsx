import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  Decoration,
  ViewPlugin,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { RangeSetBuilder } from "@codemirror/state";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayParser, astToHTML } from "@/utils/playParser";
import ShadowPreview from "@/components/editors/ShadowPreview";
import { shadowPreviewCSS } from "@/utils/shadowPreview";

const DEMO_TEXT = `#Acte I
##Scène 1
(Un salon, fin d'après-midi. La lumière décline.)
@Alice
(hésitante) Tu crois qu'on peut encore (elle regarde la fenêtre) changer quelque chose ?
(Un silence.)
@Thomas
Peut-être. Mais pas ce soir.`;

function createPlayHighlighter() {
  const lineHighlighter = ViewPlugin.fromClass(
    class {
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
            builder.add(line.from, line.from, Decoration.line({ class: "cm-scene" }));
          } else if (/^#(?!#)\s*/.test(text)) {
            builder.add(line.from, line.from, Decoration.line({ class: "cm-act" }));
          } else if (/^@\s*/.test(text)) {
            builder.add(line.from, line.from, Decoration.line({ class: "cm-character" }));
          } else if (/^\([^)]*\)\s*$/.test(text)) {
            builder.add(line.from, line.from, Decoration.line({ class: "cm-didascalie" }));
          } else {
            const regex = /\([^)]+\)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
              builder.add(
                line.from + match.index,
                line.from + match.index + match[0].length,
                Decoration.mark({ class: "cm-didascalie-inline" }),
              );
            }
          }

          pos = line.to + 1;
        }

        return builder.finish();
      }
    },
    { decorations: (v) => v.decorations },
  );

  return [
    lineHighlighter,
    EditorView.theme({
      "&": {
        height: "100%",
        fontSize: "13px",
        fontFamily: '"Source Code Pro", "Fira Code", ui-monospace, monospace',
        backgroundColor: "transparent",
      },
      ".cm-scroller": { overflow: "auto", fontFamily: "inherit" },
      ".cm-content": { padding: "16px", paddingLeft: "0", minHeight: "100%" },
      ".cm-line": { padding: "0 4px", lineHeight: "1.6" },
      ".cm-gutters": {
        backgroundColor: "hsl(0 0% 98%)",
        color: "#9ca3af",
        borderRight: "1px solid hsl(0 0% 90%)",
      },
      ".cm-act": { color: "oklch(58.6% 0.253 17.585)", fontWeight: "600" },
      ".cm-scene": { color: "oklch(58.6% 0.253 17.585)", fontWeight: "600" },
      ".cm-character": { color: "oklch(54.6% 0.245 262.881)", fontWeight: "600" },
      ".cm-didascalie": { color: "oklch(44.6% 0.03 256.802)", fontStyle: "italic" },
      ".cm-didascalie-inline": { color: "oklch(44.6% 0.03 256.802)", fontStyle: "italic" },
      "&.cm-focused": { outline: "none" },
    }),
  ];
}

const parser = new PlayParser();

export default function DemoEditor() {
  const [content, setContent] = useState(DEMO_TEXT);
  const [typingDone, setTypingDone] = useState(false);
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const cancelRef = useRef(null);

  const previewHTML = useMemo(() => {
    const ast = parser.parse(content);
    return astToHTML(ast);
  }, [content]);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = createPlayHighlighter();

    const startState = EditorState.create({
      doc: "",
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

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };
    let i = 0;
    const typeChar = () => {
      if (cancelled) return;
      if (i >= DEMO_TEXT.length) { setTypingDone(true); return; }
      view.dispatch({
        changes: { from: i, to: i, insert: DEMO_TEXT[i] },
      });
      i++;
      const delay = DEMO_TEXT[i - 1] === "\n" ? 120 : 25;
      setTimeout(typeChar, delay);
    };
    setTimeout(typeChar, 400);

    return () => {
      cancelled = true;
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  const handleReset = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    cancelRef.current?.();
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: "" },
    });
    setContent("");
    setTypingDone(false);
    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };
    let i = 0;
    const typeChar = () => {
      if (cancelled || i >= DEMO_TEXT.length) {
        if (!cancelled && i >= DEMO_TEXT.length) setTypingDone(true);
        return;
      }
      view.dispatch({
        changes: { from: i, to: i, insert: DEMO_TEXT[i] },
      });
      i++;
      const delay = DEMO_TEXT[i - 1] === "\n" ? 120 : 25;
      setTimeout(typeChar, delay);
    };
    setTimeout(typeChar, 400);
  }, []);

  return (
    <div className="overflow-hidden rounded-sm border-2 border-border bg-card shadow-brutal-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 md:divide-border bg-white">
        {/* CodeMirror editor */}
        <div className="relative h-72 overflow-hidden md:h-96">
          <div ref={editorRef} className="h-full w-full" />
          {typingDone && (
            <div className="absolute right-4 bottom-4 animate-in fade-in duration-1000">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-primary bg-primary/10 hover:text-white hover:bg-primary"
              >
                <RotateCcw className="stroke-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="h-72 overflow-auto border-t-2 border-border md:h-96 md:border-t-0">
          <ShadowPreview
            css={shadowPreviewCSS}
            htmlContent={previewHTML}
            layout="centered"
            className="h-full p-4 sm:p-6"
          />
        </div>
      </div>
    </div>
  );
}
