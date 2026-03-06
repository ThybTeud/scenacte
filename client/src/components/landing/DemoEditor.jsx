import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
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
import { RotateCcw, Printer, Save, AlignCenter, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayParser, astToHTML } from "@/utils/playParser";
import ShadowPreview from "@/components/editors/ShadowPreview";
import { shadowPreviewCSS, adaptForShadow } from "@/utils/shadowPreview";
import { DEFAULT_PRESETS, generatePresetCSS } from "@/config/template-presets";

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

const PRESET_ICONS = {
  classique: AlignCenter,
  moderne: AlignLeft,
};

export default function DemoEditor({ tabsVisible = false }) {
  const [content, setContent] = useState(DEMO_TEXT);
  const [typingDone, setTypingDone] = useState(false);
  const [presetId, setPresetId] = useState("classique");
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const cancelRef = useRef(null);

  const preset = DEFAULT_PRESETS[presetId];

  const previewHTML = useMemo(() => {
    const ast = parser.parse(content);
    return astToHTML(ast);
  }, [content]);

  const fullCSS = useMemo(() => {
    const overrides = adaptForShadow(generatePresetCSS(preset));
    return shadowPreviewCSS + "\n" + overrides;
  }, [preset]);

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
    <div className="md:mx-32">
      {/* Bookmark tabs — outside the demo box, above preview */}
      <div className="hidden md:grid grid-cols-2 -mb-[2px] relative z-10 overflow-hidden">
        <div aria-hidden="true" />
        <div className="flex justify-start pl-1 overflow-hidden">
          <motion.div
            id="demo-preset-tabs"
            className="flex"
            initial={{ y: "100%" }}
            animate={{ y: tabsVisible ? 0 : "100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {Object.entries(DEFAULT_PRESETS).map(([id], index) => {
              const Icon = PRESET_ICONS[id];
              return (
                <button
                  key={id}
                  id={index === 0 ? "demo-tab-templates" : undefined}
                  onClick={() => setPresetId(id)}
                  className={[
                    "size-10 flex items-center justify-center border-2 border-border border-b-0 rounded-t-sm transition-colors",
                    presetId === id
                      ? "bg-white text-foreground"
                      : "bg-muted text-muted-foreground hover:bg-white hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-5" />
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border-2 border-border bg-card shadow-brutal-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 md:divide-border bg-white">
          {/* CodeMirror editor */}
          <div id="demo-editor-panel" className="relative h-72 overflow-hidden md:h-108">
            <span id="demo-first-line" className="absolute top-3 left-1/3 w-0 h-4" aria-hidden="true" />
            <div ref={editorRef} className="h-full w-full" />
            {typingDone && (
              <div className="absolute left-8 bottom-4 animate-in fade-in duration-1000">
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
          <div id="demo-preview-panel" className="h-72 overflow-auto border-t-2 border-border md:h-108 md:border-t-0">
            {/* Mobile preset toggle */}
            <div className="flex md:hidden border-b-2 border-border">
              {Object.entries(DEFAULT_PRESETS).map(([id, p]) => (
                <button
                  key={id}
                  onClick={() => setPresetId(id)}
                  className={[
                    "flex-1 px-3 py-1.5 text-xs font-medium transition-colors",
                    presetId === id
                      ? "bg-white text-foreground"
                      : "bg-muted/60 text-muted-foreground",
                  ].join(" ")}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <ShadowPreview
              css={fullCSS}
              htmlContent={previewHTML}
              layout={preset.layout}
              className="h-full p-4 sm:p-6"
            />
          </div>
        </div>
      </div>

      {/* Bookmark tabs — bottom, outside the demo box */}
      <div className="hidden md:grid grid-cols-2 -mt-[2px] relative z-10 overflow-hidden">
        <div className="flex justify-end pr-1 overflow-hidden">
          <motion.button
            id="demo-tab-save"
            className="size-10 flex items-center justify-center border-2 border-border border-t-0 rounded-b-sm bg-white text-foreground hover:bg-muted transition-colors"
            initial={{ y: "-100%" }}
            animate={{ y: tabsVisible ? 0 : "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Save className="size-5" />
          </motion.button>
        </div>
        <div className="flex justify-end pr-1 overflow-hidden">
          <motion.button
            id="demo-tab-print"
            className="size-10 flex items-center justify-center border-2 border-border border-t-0 rounded-b-sm bg-white text-foreground hover:bg-muted transition-colors"
            initial={{ y: "-100%" }}
            animate={{ y: tabsVisible ? 0 : "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <Printer className="size-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
