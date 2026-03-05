import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 5 légendes features positionnées autour de la démo.
 *
 * Design : texte rose (primary) sans fond ni bordure,
 * trait rectiligne rose reliant le texte à la démo,
 * point à l'extrémité côté démo.
 * Hover → tout passe à opacité 1 + le point pulse.
 */

const FEATURES = [
  {
    label: 'Syntaxe simplifiée',
    desc: 'Un @ pour un personnage, un # pour un acte.',
    // Position du texte + direction du trait
    anchor: { top: '-48px', left: '24px' },
    line: { x1: 0, y1: 20, x2: 0, y2: 48, w: 2, h: 50 },
  },
  {
    label: 'Preview temps réel',
    desc: 'Votre texte se met en forme au fil de la frappe.',
    anchor: { top: '-48px', right: '24px' },
    line: { x1: 0, y1: 20, x2: 0, y2: 48, w: 2, h: 50 },
  },
  {
    label: 'Templates',
    desc: 'Un modèle de mise en page adapté à votre style.',
    anchor: { top: '50%', left: '-16px', transform: 'translate(-100%, -50%)' },
    line: { x1: 40, y1: 10, x2: 0, y2: 10, w: 42, h: 20, horizontal: true },
  },
  {
    label: 'Export PDF',
    desc: 'Un clic, un PDF aux normes éditoriales.',
    anchor: { bottom: '-48px', left: '24px' },
    line: { x1: 0, y1: 0, x2: 0, y2: 28, w: 2, h: 30, fromTop: true },
  },
  {
    label: 'Versioning',
    desc: 'Chaque version sauvegardée automatiquement.',
    anchor: { bottom: '-48px', right: '24px' },
    line: { x1: 0, y1: 0, x2: 0, y2: 28, w: 2, h: 30, fromTop: true },
  },
];

// Positions de la ligne + point pour chaque feature
const LINE_CONFIGS = [
  // Syntaxe — trait vertical vers le bas, point en bas
  { svgClass: 'left-2 top-full', w: 4, h: 30, line: 'M2 0 V30', dot: [2, 28] },
  // Preview — trait vertical vers le bas, point en bas
  { svgClass: 'right-2 top-full', w: 4, h: 30, line: 'M2 0 V30', dot: [2, 28] },
  // Templates — trait horizontal vers la droite, point à droite
  { svgClass: 'top-1/2 left-full -translate-y-1/2', w: 30, h: 4, line: 'M0 2 H30', dot: [28, 2] },
  // Export PDF — trait vertical vers le haut, point en haut
  { svgClass: 'left-2 bottom-full', w: 4, h: 30, line: 'M2 30 V0', dot: [2, 2] },
  // Versioning — trait vertical vers le haut, point en haut
  { svgClass: 'right-2 bottom-full', w: 4, h: 30, line: 'M2 30 V0', dot: [2, 2] },
];

// Positions absolues du groupe texte+trait autour de la démo
const POSITION_STYLES = [
  // Syntaxe simplifiée — au-dessus à gauche
  { top: 0, left: '24px', transform: 'translateY(calc(-100% - 30px))' },
  // Preview temps réel — au-dessus à droite
  { top: 0, right: '24px', transform: 'translateY(calc(-100% - 30px))' },
  // Templates — à gauche, centré verticalement
  { top: '50%', left: 0, transform: 'translate(calc(-100% - 30px), -50%)' },
  // Export PDF — en dessous à gauche
  { bottom: 0, left: '24px', transform: 'translateY(calc(100% + 30px))' },
  // Versioning — en dessous à droite
  { bottom: 0, right: '24px', transform: 'translateY(calc(100% + 30px))' },
];

export default function FeatureOverlay({ visibleCount }) {
  return (
    <>
      {FEATURES.map(({ label, desc }, index) => {
        const isVisible = index < visibleCount;
        const age = visibleCount - 1 - index;
        const baseOpacity = isVisible ? Math.max(0.3, 1 - age * 0.2) : 0;
        const lineConfig = LINE_CONFIGS[index];
        const posStyle = POSITION_STYLES[index];

        return (
          <FeatureLabel
            key={label}
            label={label}
            desc={desc}
            isVisible={isVisible}
            baseOpacity={baseOpacity}
            lineConfig={lineConfig}
            posStyle={posStyle}
            index={index}
          />
        );
      })}
    </>
  );
}

function FeatureLabel({ label, desc, isVisible, baseOpacity, lineConfig, posStyle, index }) {
  const [hovered, setHovered] = useState(false);
  const opacity = hovered && isVisible ? 1 : baseOpacity;

  // Direction d'entrée de l'animation
  const isBottom = index >= 3;
  const isLeft = index === 2;
  const initialY = isLeft ? 0 : (isBottom ? 10 : -10);
  const initialX = isLeft ? -10 : 0;

  return (
    <motion.div
      className="absolute z-10"
      style={{ ...posStyle, pointerEvents: isVisible ? 'auto' : 'none' }}
      initial={{ opacity: 0, x: initialX, y: initialY }}
      animate={{ opacity, x: isVisible ? 0 : initialX, y: isVisible ? 0 : initialY }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Texte */}
      <div className="relative whitespace-nowrap select-none">
        <p className="text-sm font-bold text-primary">{label}</p>
        {hovered && (
          <p className="text-xs text-primary/70">{desc}</p>
        )}

        {/* Trait rectiligne + point rond */}
        <svg
          className={`absolute ${lineConfig.svgClass} text-primary`}
          width={lineConfig.w}
          height={lineConfig.h}
          fill="none"
        >
          <path
            d={lineConfig.line}
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Point à l'extrémité côté démo */}
          <motion.circle
            cx={lineConfig.dot[0]}
            cy={lineConfig.dot[1]}
            r="3"
            fill="currentColor"
            animate={hovered ? { scale: [1, 1.6, 1] } : { scale: 1 }}
            transition={hovered ? { duration: 0.8, repeat: Infinity } : {}}
          />
        </svg>
      </div>
    </motion.div>
  );
}
