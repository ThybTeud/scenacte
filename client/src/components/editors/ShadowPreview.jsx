import { useRef, useEffect } from "react";

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
 */
export default function ShadowPreview({ css, htmlContent, layout, className }) {
  const hostRef = useRef(null);
  const shadowRef = useRef(null);

  useEffect(() => {
    if (hostRef.current && !shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: "open" });
    }
  }, []);

  useEffect(() => {
    const shadow = shadowRef.current;
    if (!shadow) return;

    shadow.innerHTML = `
      <style>
        ${css}
      </style>
      <div class="play-root" data-layout="${layout || ""}">
        ${htmlContent || ""}
      </div>
    `;
  }, [css, htmlContent, layout]);

  return <div ref={hostRef} className={className} />;
}
