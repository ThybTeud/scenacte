import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theater, GraduationCap, Users } from 'lucide-react';

const TARGETS = [
  {
    id: 'acteurs',
    icon: Theater,
    label: 'Acteurs',
    description: 'Annotez vos textes, repérez vos répliques, travaillez votre rôle.',
    color: 'bg-primary/10 border-primary/30',
    x: 80,
    y: 100,
  },
  {
    id: 'enseignants',
    icon: GraduationCap,
    label: 'Enseignants',
    description: 'Un outil simple pour vos ateliers d\'écriture dramatique.',
    color: 'bg-blue/10 border-blue/30',
    x: 260,
    y: 60,
  },
  {
    id: 'compagnies',
    icon: Users,
    label: 'Compagnies',
    description: 'Partagez et exportez vos textes dans un format professionnel.',
    color: 'bg-gray/10 border-gray/30',
    x: 440,
    y: 100,
  },
];

export default function TargetsIllustration() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center font-[Space_Grotesk] text-2xl font-bold text-foreground sm:text-3xl">
          Pensé pour tous les gens de théâtre
        </h2>

        {/* Interactive illustration */}
        <div className="relative mx-auto max-w-lg">
          {/* SVG backdrop — stage/theater shape */}
          <svg viewBox="0 0 600 240" className="w-full" aria-hidden="true">
            {/* Stage floor */}
            <rect x="40" y="170" width="520" height="40" rx="4"
              fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
            {/* Curtain left */}
            <path d="M60 30 Q60 170 80 170" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" className="text-primary/40" />
            <path d="M80 20 Q75 170 100 170" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" className="text-primary/40" />
            {/* Curtain right */}
            <path d="M540 30 Q540 170 520 170" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" className="text-primary/40" />
            <path d="M520 20 Q525 170 500 170" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" className="text-primary/40" />
            {/* Stage arch */}
            <path d="M40 170 Q40 10 300 10 Q560 10 560 170" fill="none"
              stroke="currentColor" strokeWidth="3" className="text-border" />
          </svg>

          {/* Interactive character positions */}
          <div className="absolute inset-0">
            {TARGETS.map((target) => {
              const Icon = target.icon;
              const isHovered = hovered === target.id;
              // Convert SVG coords to percentages
              const left = `${(target.x / 600) * 100}%`;
              const top = `${(target.y / 240) * 100}%`;

              return (
                <div
                  key={target.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left, top }}
                  onMouseEnter={() => setHovered(target.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Character circle */}
                  <motion.div
                    className={`flex size-14 cursor-pointer items-center justify-center rounded-full border-2 ${target.color} transition-colors sm:size-16`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="size-6 text-foreground sm:size-7" />
                  </motion.div>

                  {/* Label */}
                  <p className="mt-1 text-center text-xs font-semibold text-foreground">
                    {target.label}
                  </p>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-20 w-48 rounded-sm border-2 border-border bg-card px-3 py-2 shadow-brutal-sm"
                      >
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {target.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
