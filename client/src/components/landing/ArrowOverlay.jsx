const PRIMARY = 'oklch(71.2% 0.194 13.428)';

/**
 * SVG overlay that renders straight-line arrows (horizontal + optional 45° diagonal)
 * with a pulsing dot at each end point.
 *
 * No geometry logic here — all paths come from useArrows.
 *
 * Props:
 *   paths       — Array<{points: [{x,y},...], end: {x,y}} | null>
 *   arrowStyles — Array<{opacity: number, pulse: boolean}>
 */
export default function ArrowOverlay({ paths, arrowStyles }) {
  if (!paths.length) return null;

  return (
    <svg
      className="hidden md:block absolute inset-0 pointer-events-none"
      style={{ overflow: 'visible', width: 0, height: 0 }}
      aria-hidden="true"
    >
      {paths.map((path, i) => {
        if (!path) return null;
        const style = arrowStyles?.[i] ?? { opacity: 1, pulse: false };
        const pointsStr = path.points.map((p) => `${p.x},${p.y}`).join(' ');

        return (
          <g key={i} style={{ opacity: style.opacity, transition: 'opacity 0.4s' }}>
            <polyline
              points={pointsStr}
              stroke={PRIMARY}
              strokeWidth="1.5"
              fill="none"
            />
            <circle
              cx={path.end.x}
              cy={path.end.y}
              r="3"
              fill={PRIMARY}
              className={style.pulse ? 'arrow-pulse' : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
}
