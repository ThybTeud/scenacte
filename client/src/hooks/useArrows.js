import { useState, useEffect, useRef } from 'react';

/**
 * Calculates SVG polyline paths (horizontal + optional 45° diagonal segments)
 * between DOM elements identified by ID, relative to a container element.
 *
 * @param {Array<{from: string, to: string, fromSide: 'left'|'right'}>} arrows
 * @param {React.RefObject<HTMLElement>} containerRef
 * @returns {{ paths: Array<{points: Array<{x,y}>, end: {x,y}}|null> }}
 */
export function useArrows(arrows, containerRef, invalidate) {
  const [paths, setPaths] = useState([]);
  const arrowsRef = useRef(arrows);
  arrowsRef.current = arrows;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setPaths(computePaths(arrowsRef.current, container));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(arrows), containerRef, invalidate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const c = containerRef.current;
      if (c) setPaths(computePaths(arrowsRef.current, c));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  return { paths };
}

/**
 * Pure computation — exported for testing.
 *
 * Geometry rules:
 * - Start : centre du bord `fromSide` de l'élément `from`
 * - End   : centre du bord opposé (le plus proche) de l'élément `to`
 * - If |deltaY| < 5px → single horizontal segment
 * - Otherwise         → horizontal segment + 45° diagonal
 *   Junction: junctionX = endX − sign × |deltaY|
 *             where sign = +1 (right) or −1 (left)
 */
export function computePaths(arrows, container) {
  const containerRect = container.getBoundingClientRect();

  return arrows.map(({ from, to, fromSide }) => {
    const fromEl = document.getElementById(from);
    const toEl = document.getElementById(to);
    if (!fromEl || !toEl) return null;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    // Start: centre of fromSide edge
    const startX =
      fromSide === 'right'
        ? fromRect.right - containerRect.left
        : fromRect.left - containerRect.left;
    const startY = fromRect.top + fromRect.height / 2 - containerRect.top;

    // End: centre of nearest edge of target
    const endX =
      fromSide === 'right'
        ? toRect.left - containerRect.left
        : toRect.right - containerRect.left;
    const endY = toRect.top + toRect.height / 2 - containerRect.top;

    const deltaY = endY - startY;

    if (Math.abs(deltaY) < 5) {
      return {
        points: [
          { x: startX, y: startY },
          { x: endX, y: endY },
        ],
        end: { x: endX, y: endY },
      };
    }

    // Horizontal first, then 45° diagonal
    // sign: +1 when going right, -1 when going left
    const sign = fromSide === 'right' ? 1 : -1;
    const junctionX = endX - sign * Math.abs(deltaY);

    return {
      points: [
        { x: startX, y: startY },
        { x: junctionX, y: startY },
        { x: endX, y: endY },
      ],
      end: { x: endX, y: endY },
    };
  });
}
