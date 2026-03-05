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
  { label: 'Syntaxe simplifiée', desc: 'Un @ pour un personnage, un # pour un acte.', align: 'right' },
  { label: 'Aperçu en temps réel', desc: 'Votre texte se met en forme au fil de la frappe.', align: 'left' },
  { label: 'Templates', desc: 'Un modèle de mise en page adapté à votre style.', align: 'left' },
  { label: 'Export PDF', desc: 'Un clic, un PDF aux normes éditoriales.', align: 'left' },
  { label: 'Sauvegarde automatique', desc: 'Votre travail est sauvegardé automatiquement pour ne rien perdre.', align: 'right' },
];

// Trait rectiligne (SVG) : part du texte, traverse le gap, entre dans la démo.
// Le gap entre texte et bord de démo = 40px. Le trait fait 60px (20px dans la démo).
const LINE_CONFIGS = [
  // Syntaxe — horizontal puis diagonale, point en bas (dans la démo)
  { svgClass: '', line: 'M132 -9 H 192 L 250 41', dot: [250, 41] },
  // Preview — horizontale, point à gauche (dans la démo)
  { svgClass: '', line: 'M-4 -9 H-100', dot: [-100, -9] },
  // Templates — horizontal vers la droite, point à droite (dans la démo)
  { svgClass: '', line: 'M-4 -9 H-270 L -300 21', dot: [-300, 21] },
  // Export PDF — vertical vers le haut, point en haut (dans la démo)
  { svgClass: '', line: 'M-4 -9 H-80 L -120 -31', dot: [-120, -31] },
  // Versioning — vertical vers le haut, point en haut
  { svgClass: '', line: 'M180 -9 H 340 L 380 -31', dot: [380, -31] },
];

// Position du groupe annotation (texte + trait) par rapport au conteneur de la démo.
const POSITION_STYLES = [
  // Syntaxe simplifiée — au-dessus à gauche
  { top: '-10%', left: '0'},
  // Preview temps réel — au-dessus à droite
  { top: '50%', right: '-10%'},
  // Templates — à gauche, centré verticalement
  { top: '-15%', right: '5%'},
  // Export PDF — en dessous à gauche
  { bottom: '-15%', right: '-5%'},
  // Versioning — en dessous à droite
  { bottom: '-15%', left: '24px'},
];

export default function FeatureAnnotations({ visibleCount }) {
  return (
    <>
      {FEATURES.map(({ label, desc, align }, index) => {
        const isVisible = index < visibleCount;
        const age = visibleCount - 1 - index;
        const baseOpacity = isVisible ? Math.max(0.3, 1 - age * 0.2) : 0;

        return (
          <AnnotationLabel
            key={label}
            label={label}
            desc={desc}
            align={align}
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

function AnnotationLabel({ label, desc, align, isVisible, baseOpacity, lineConfig, posStyle, index }) {
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
      <div className={`relative whitespace-nowrap select-none ${align === 'right' ? 'text-right' : 'text-left'}`}>
        <p className="text-sm font-bold text-primary">{label}</p>
        {hovered && (
          <p className={`absolute text-xs text-primary/70 ${align === 'right' ? 'right-0' : 'left-0'}`}>{desc}</p>
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
