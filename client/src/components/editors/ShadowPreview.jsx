import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";

/**
 * Renders HTML content + CSS inside a Shadow DOM to achieve
 * full CSS isolation — template styles cannot leak into the host page.
 *
 * @param {Object} props
 * @param {string} props.css - CSS injected inside the shadow root (<style> block)
 * @param {string} props.htmlContent - Raw HTML rendered inside .play-root.
 *   Trusted: generated internally by astToHTML (playTransformers), never from
 *   user-supplied raw HTML. Changing the source requires reviewing the
 *   innerHTML assignment below.
 * @param {string} [props.layout] - Value set on data-layout (e.g. "centered", "inline")
 * @param {string} [props.className] - CSS classes applied to the host <div>
 * @param {function} [props.onLineClick] - Callback appelé avec le numéro de ligne (0-indexed)
 *   quand l'utilisateur clique sur un élément de la preview.
 */
const ShadowPreview = forwardRef(function ShadowPreview(
  { css, htmlContent, layout, className, onLineClick },
  ref
) {
  const hostRef = useRef(null);
  const shadowRef = useRef(null);
  // Ref vers le callback pour éviter de re-créer le listener si le callback change
  const onLineClickRef = useRef(onLineClick);

  useEffect(() => {
    onLineClickRef.current = onLineClick;
  }, [onLineClick]);

  // Création du shadow root + listener clic (une seule fois)
  useEffect(() => {
    if (hostRef.current && !shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: "open" });

      shadowRef.current.addEventListener("click", (e) => {
        const el = e.target.closest("[data-line]");
        if (el && onLineClickRef.current) {
          onLineClickRef.current(parseInt(el.dataset.line, 10));
        }
      });
    }
  }, []);

  // Mise à jour du contenu
  useEffect(() => {
    const shadow = shadowRef.current;
    if (!shadow) return;

    shadow.innerHTML = `
      <style>
        ${css}
        [data-line] { cursor: pointer; transition: background-color 0.1s ease; }
        [data-line]:not(span):hover:not(:has([data-line]:hover)) { background-color: oklch(71.2% 0.194 13.428 / 0.07); }
      </style>
      <div class="play-root" data-layout="${layout || ""}">
        ${htmlContent || ""}
      </div>
    `;
  }, [css, htmlContent, layout]);

  /**
   * Scrolle la preview pour montrer l'élément le plus proche de lineNumber.
   * @param {number} lineNumber - Numéro de ligne 0-indexed
   * @param {HTMLElement} scrollContainer - Le conteneur scrollable parent
   */
  useImperativeHandle(ref, () => ({
    scrollToLine: (lineNumber, scrollContainer) => {
      const shadow = shadowRef.current;
      if (!shadow || !scrollContainer) return;

      const elements = [...shadow.querySelectorAll("[data-line]")];
      if (elements.length === 0) return;

      // Trouver l'élément avec data-line <= lineNumber (le plus proche par dessous)
      let best = elements[0];
      for (const el of elements) {
        if (parseInt(el.dataset.line, 10) <= lineNumber) best = el;
        else break;
      }

      const top =
        best.getBoundingClientRect().top -
        scrollContainer.getBoundingClientRect().top +
        scrollContainer.scrollTop -
        24;

      scrollContainer.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    },
  }));

  return <div ref={hostRef} className={className} />;
});

export default ShadowPreview;
