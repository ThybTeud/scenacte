import { motion } from 'framer-motion';
import { Code, Eye, Palette, FileText, History } from 'lucide-react';

const FEATURES = [
  {
    icon: Code,
    label: 'Syntaxe simplifiée',
    position: 'top-left',
    arrow: 'bottom-right',
  },
  {
    icon: Eye,
    label: 'Preview temps réel',
    position: 'top-right',
    arrow: 'bottom-left',
  },
  {
    icon: Palette,
    label: 'Templates',
    position: 'left',
    arrow: 'right',
  },
  {
    icon: FileText,
    label: 'Export PDF',
    position: 'bottom-left',
    arrow: 'top-right',
  },
  {
    icon: History,
    label: 'Versioning',
    position: 'bottom-right',
    arrow: 'top-left',
  },
];

// Positions outside the demo box
const POSITION_CLASSES = {
  'top-left': '-top-10 left-4',
  'top-right': '-top-10 right-4',
  'left': 'top-1/2 -translate-y-1/2 -left-4 -translate-x-full',
  'bottom-left': '-bottom-10 left-4',
  'bottom-right': '-bottom-10 right-4',
};

// Arrow/line directions (small SVG lines pointing toward the demo)
const ARROW_PATHS = {
  'bottom-right': 'M0 0 L12 12',
  'bottom-left': 'M12 0 L0 12',
  'right': 'M0 6 L14 6',
  'top-right': 'M0 12 L12 0',
  'top-left': 'M12 12 L0 0',
};

const ARROW_OFFSETS = {
  'bottom-right': 'left-1 -bottom-3.5',
  'bottom-left': 'right-1 -bottom-3.5',
  'right': '-right-4 top-1/2 -translate-y-1/2',
  'top-right': 'left-1 -top-3.5',
  'top-left': 'right-1 -top-3.5',
};

/**
 * Compact pill overlays with arrow lines pointing toward the demo.
 * Opacity degrades for older overlays: latest=1, previous ones fade progressively.
 */
export default function FeatureOverlay({ visibleCount }) {
  return (
    <>
      {FEATURES.map(({ icon: Icon, label, position, arrow }, index) => {
        const isVisible = index < visibleCount;
        // Dégradé d'opacité : la plus récente à 1, les précédentes s'atténuent
        const age = visibleCount - 1 - index;
        const opacity = isVisible ? Math.max(0.35, 1 - age * 0.2) : 0;

        return (
          <motion.div
            key={label}
            className={`absolute z-10 ${POSITION_CLASSES[position]}`}
            initial={{ opacity: 0, y: position.startsWith('bottom') ? 8 : -8 }}
            animate={{
              opacity,
              y: isVisible ? 0 : (position.startsWith('bottom') ? 8 : -8),
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
          >
            {/* Pill */}
            <div className="relative flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1 shadow-brutal-sm whitespace-nowrap">
              <Icon className="size-3.5 shrink-0 text-primary" />
              <span className="text-xs font-semibold text-foreground">{label}</span>

              {/* Trait/flèche vers la démo */}
              <svg
                className={`absolute ${ARROW_OFFSETS[arrow]} text-border`}
                width="14" height="14" viewBox="0 0 14 14"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                <path d={ARROW_PATHS[arrow]} />
              </svg>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
