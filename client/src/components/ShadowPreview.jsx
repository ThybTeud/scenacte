import { useRef, useEffect } from "react";

/**
 * Renders HTML content + CSS inside a Shadow DOM to achieve
 * full CSS isolation — template styles cannot leak into the host page.
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
        :host { padding: 1rem; }
        ${css}
      </style>
      <div class="play-root" data-layout="${layout || ""}">
        ${htmlContent || ""}
      </div>
    `;
  }, [css, htmlContent, layout]);

  return <div ref={hostRef} className={className} />;
}
