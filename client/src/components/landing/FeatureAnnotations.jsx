import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useArrows } from '@/hooks/useArrows';
import ArrowOverlay from '@/components/landing/ArrowOverlay';

/**
 * 5 annotations features positionnées à l'extérieur de la démo.
 *
 * Design : texte rose (primary) sans fond ni bordure,
 * trait rectiligne rose reliant le texte à un point à l'intérieur de la démo.
 * Hover → opacité 1 + le point pulse.
 */

const FEATURES = [
  {
    id: 'legend-syntax',
    label: 'Syntaxe simplifiée',
    desc: 'Un @ pour un personnage, un # pour un acte.',
    align: 'right',
    posStyle: { top: '-10%', left: '0' },
    arrowTo: 'demo-first-line',
  },
  {
    id: 'legend-preview',
    label: 'Aperçu en temps réel',
    desc: 'Votre texte se met en forme au fil de la frappe.',
    align: 'left',
    posStyle: { top: '50%', right: '-10%' },
    arrowTo: 'demo-preview-panel',
  },
  {
    id: 'legend-templates',
    label: 'Templates',
    desc: 'Un modèle de mise en page adapté à votre style.',
    align: 'left',
    posStyle: { top: '-15%', right: '5%' },
    arrowTo: 'demo-tab-templates',
  },
  {
    id: 'legend-export',
    label: 'Export PDF',
    desc: 'Un clic, un PDF aux normes éditoriales.',
    align: 'left',
    posStyle: { bottom: '-15%', right: '-5%' },
    arrowTo: 'demo-tab-print',
  },
  {
    id: 'legend-autosave',
    label: 'Sauvegarde automatique',
    desc: 'Votre travail est sauvegardé automatiquement pour ne rien perdre.',
    align: 'right',
    posStyle: { bottom: '-15%', left: '24px' },
    arrowTo: 'demo-tab-save',
  },
];

// fromSide dérive de align : 'right' → texte à gauche, trait part vers la droite
const ARROWS = FEATURES.map(({ id, arrowTo, align }) => ({
  from: id,
  to: arrowTo,
  fromSide: align === 'right' ? 'right' : 'left',
}));

export default function FeatureAnnotations({ visibleCount, containerRef }) {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [calcTrigger, setCalcTrigger] = useState(0);

  // Recalcule les traits quand un label anime vers sa position finale.
  // Le délai 420ms correspond à la durée d'animation (400ms) + marge.
  useEffect(() => {
    const timer = setTimeout(() => setCalcTrigger((t) => t + 1), 420);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  const { paths } = useArrows(ARROWS, containerRef, calcTrigger);

  const arrowStyles = FEATURES.map((_, index) => {
    const isVisible = index < visibleCount;
    const age = visibleCount - 1 - index;
    const baseOpacity = isVisible ? Math.max(0.3, 1 - age * 0.2) : 0;
    const opacity = hoveredIndex === index && isVisible ? 1 : baseOpacity;
    return { opacity, pulse: hoveredIndex === index && isVisible };
  });

  return (
    <>
      <ArrowOverlay paths={paths} arrowStyles={arrowStyles} />
      {FEATURES.map(({ id, label, desc, align, posStyle }, index) => {
        const isVisible = index < visibleCount;
        const age = visibleCount - 1 - index;
        const baseOpacity = isVisible ? Math.max(0.3, 1 - age * 0.2) : 0;
        const opacity = hoveredIndex === index && isVisible ? 1 : baseOpacity;

        const initialX = align === 'right' ? 10 : -10;

        return (
          <motion.div
            key={id}
            id={id}
            className="absolute z-10"
            style={{ ...posStyle, pointerEvents: isVisible ? 'auto' : 'none' }}
            initial={{ opacity: 0, x: initialX }}
            animate={{ opacity, x: isVisible ? 0 : initialX }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(-1)}
          >
            <div className={`relative whitespace-nowrap select-none ${align === 'right' ? 'text-right' : 'text-left'}`}>
              <p className="text-sm font-bold text-primary">{label}</p>
              {hoveredIndex === index && (
                <p className={`absolute text-xs text-primary/70 ${align === 'right' ? 'right-0' : 'left-0'}`}>
                  {desc}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
