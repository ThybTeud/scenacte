import { motion } from 'framer-motion';
import { Code, Eye, Palette, FileText, History } from 'lucide-react';

const FEATURES = [
  {
    icon: Code,
    label: 'Syntaxe simplifiée',
    description: 'Un @ pour un personnage, un # pour un acte. Écrivez, Scenacte structure.',
    position: 'top-left',
  },
  {
    icon: Eye,
    label: 'Preview temps réel',
    description: 'Votre texte se met en forme au fil de la frappe.',
    position: 'top-right',
  },
  {
    icon: Palette,
    label: 'Templates',
    description: 'Choisissez un modèle de mise en page adapté à votre style.',
    position: 'bottom-left',
  },
  {
    icon: FileText,
    label: 'Export PDF',
    description: 'Un clic, un PDF prêt à envoyer. Aux normes éditoriales.',
    position: 'bottom-right',
  },
  {
    icon: History,
    label: 'Versioning',
    description: 'Chaque version sauvegardée. Revenez en arrière à tout moment.',
    position: 'bottom-center',
  },
];

const POSITION_CLASSES = {
  'top-left': '-top-3 -left-3 sm:-top-4 sm:-left-4',
  'top-right': '-top-3 -right-3 sm:-top-4 sm:-right-4',
  'bottom-left': '-bottom-3 -left-3 sm:-bottom-4 sm:-left-4',
  'bottom-right': '-bottom-3 -right-3 sm:-bottom-4 sm:-right-4',
  'bottom-center': '-bottom-3 left-1/2 -translate-x-1/2 sm:-bottom-4',
};

/**
 * Renders cumulative feature overlays around the demo.
 * @param {Object} props
 * @param {number} props.visibleCount - Number of features visible (0–5)
 */
export default function FeatureOverlay({ visibleCount }) {
  return (
    <>
      {FEATURES.map(({ icon: Icon, label, description, position }, index) => {
        const isVisible = index < visibleCount;
        const isLatest = index === visibleCount - 1;

        return (
          <motion.div
            key={label}
            className={`absolute z-10 ${POSITION_CLASSES[position]}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isVisible ? (isLatest ? 1 : 0.7) : 0,
              scale: isVisible ? 1 : 0.8,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
          >
            <div className="flex items-center gap-2 rounded-sm border-2 border-border bg-card px-3 py-2 shadow-brutal-sm max-w-52">
              <Icon className="size-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-[10px] leading-snug text-muted-foreground">{description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
