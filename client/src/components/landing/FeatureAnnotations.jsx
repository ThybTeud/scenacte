import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 5 annotations features positionnées à l'extérieur de la démo.
 *
 * Design : texte rose (primary) sans fond ni bordure,
 * trait rectiligne rose reliant le texte à un point à l'intérieur de la démo.
 * Hover → opacité 1 + le point pulse.
 */

const FEATURES = [
  { label: 'Syntaxe simplifiée', desc: 'Un @ pour un personnage, un # pour un acte.' },
  { label: 'Preview temps réel', desc: 'Votre texte se met en forme au fil de la frappe.' },
  { label: 'Templates', desc: 'Un modèle de mise en page adapté à votre style.' },
  { label: 'Export PDF', desc: 'Un clic, un PDF aux normes éditoriales.' },
  { label: 'Versioning', desc: 'Chaque version sauvegardée automatiquement.' },
];

// Trait rectiligne (SVG) : part du texte, traverse le gap, entre dans la démo.
// Le gap entre texte et bord de démo = 40px. Le trait fait 60px (20px dans la démo).
const LINE_CONFIGS = [
  // Syntaxe — vertical vers le bas, point en bas (dans la démo)
  { svgClass: 'left-2 top-full', w: 10, h: 60, line: 'M5 0 V60', dot: [5, 57] },
  // Preview — vertical vers le bas, point en bas
  { svgClass: 'right-2 top-full', w: 10, h: 60, line: 'M5 0 V60', dot: [5, 57] },
  // Templates — horizontal vers la droite, point à droite (dans la démo)
  { svgClass: 'top-1/2 left-full -translate-y-1/2', w: 60, h: 10, line: 'M0 5 H60', dot: [57, 5] },
  // Export PDF — vertical vers le haut, point en haut (dans la démo)
  { svgClass: 'left-2 bottom-full', w: 10, h: 60, line: 'M5 60 V0', dot: [5, 3] },
  // Versioning — vertical vers le haut, point en haut
  { svgClass: 'right-2 bottom-full', w: 10, h: 60, line: 'M5 60 V0', dot: [5, 3] },
];

// Position du groupe annotation (texte + trait) par rapport au conteneur de la démo.
// Le texte est à 40px du bord de la démo (espace visible clair).
const POSITION_STYLES = [
  // Syntaxe simplifiée — au-dessus à gauche
  { top: 0, left: '24px', transform: 'translateY(calc(-100% - 40px))' },
  // Preview temps réel — au-dessus à droite
  { top: 0, right: '24px', transform: 'translateY(calc(-100% - 40px))' },
  // Templates — à gauche, centré verticalement
  { top: '50%', left: 0, transform: 'translate(calc(-100% - 40px), -50%)' },
  // Export PDF — en dessous à gauche
  { bottom: 0, left: '24px', transform: 'translateY(calc(100% + 40px))' },
  // Versioning — en dessous à droite
  { bottom: 0, right: '24px', transform: 'translateY(calc(100% + 40px))' },
];

export default function FeatureAnnotations({ visibleCount }) {
  return (
    <>
      {FEATURES.map(({ label, desc }, index) => {
        const isVisible = index < visibleCount;
        const age = visibleCount - 1 - index;
        const baseOpacity = isVisible ? Math.max(0.3, 1 - age * 0.2) : 0;

        return (
          <AnnotationLabel
            key={label}
            label={label}
            desc={desc}
            isVisible={isVisible}
            baseOpacity={baseOpacity}
            lineConfig={LINE_CONFIGS[index]}
            posStyle={POSITION_STYLES[index]}
            index={index}
          />
        );
      })}
    </>
  );
}

function AnnotationLabel({ label, desc, isVisible, baseOpacity, lineConfig, posStyle, index }) {
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
          overflow="visible"
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
