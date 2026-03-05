import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import DemoEditor from '@/components/landing/DemoEditor';
import FeatureOverlay from '@/components/landing/FeatureOverlay';

/**
 * ScrollStory — orchestrateur scroll-driven :
 *
 * Étape 1 (0–10%)  : Splash — titre + démo visibles ensemble (h-screen)
 * Étape 2 (10–20%) : Titre fade out (opacité → 0), démo reste sticky centrée
 * Étape 3 (20–80%) : Démo sticky, 5 légendes features en overlay cumulatif
 * Étape 4 (80–100%): Démo se libère du sticky, scroll hors écran
 *
 * Hauteur 500vh ≈ 100vh par étape, crée la piste de scroll pour le sticky.
 */
export default function ScrollStory() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Titre : opacité 1 → 0 entre 0% et 12% du scroll
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Seuils d'apparition des 5 légendes features
  const featureThresholds = [0.2, 0.32, 0.44, 0.56, 0.68];

  return (
    // 500vh ≈ 100vh par étape (splash, fade, 3×features scroll, unpin)
    <div ref={containerRef} className="relative" style={{ height: '500vh' }}>
      {/* Sticky wrapper — occupe tout le viewport, se fixe pendant le scroll */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Titre — fade out lié au scroll progress */}
          <motion.div
            className="mb-6 max-w-3xl text-center"
            style={{ opacity: titleOpacity }}
          >
            <h1 className="font-[Space_Grotesk] text-3xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              L'éditeur pensé pour{" "}
              <span className="text-primary">l'écriture théâtrale.</span>
            </h1>
          </motion.div>

          {/* Démo + overlays features */}
          <div className="relative w-full max-w-5xl">
            <FeatureOverlayController
              scrollYProgress={scrollYProgress}
              thresholds={featureThresholds}
            />
            <DemoEditor />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureOverlayController({ scrollYProgress, thresholds }) {
  const visibleCount = useVisibleCount(scrollYProgress, thresholds);
  return <FeatureOverlay visibleCount={visibleCount} />;
}

function useVisibleCount(scrollYProgress, thresholds) {
  const countValue = useTransform(scrollYProgress, (progress) => {
    let count = 0;
    for (const t of thresholds) {
      if (progress >= t) count++;
      else break;
    }
    return count;
  });

  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubscribe = countValue.on('change', (v) => setCount(v));
    return unsubscribe;
  }, [countValue]);

  return count;
}
