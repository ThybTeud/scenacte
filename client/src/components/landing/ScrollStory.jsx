import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import DemoEditor from '@/components/landing/DemoEditor';
import FeatureAnnotations from '@/components/landing/FeatureAnnotations';

/**
 * ScrollStory — orchestrateur scroll-driven :
 *
 * Étape 1 (0–10%)  : Splash — titre en haut, démo plus bas (espace visible)
 * Étape 2 (10–20%) : Titre fade out, démo remonte progressivement au centre
 * Étape 3 (20–80%) : Démo sticky centrée, 5 annotations features en overlay cumulatif
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

  // Démo : pull-up de +80px → 0 entre 0% et 18% du scroll
  const demoOffset = useTransform(scrollYProgress, [0, 0.18], [80, 0]);

  // Seuils d'apparition des 5 annotations features
  const featureThresholds = [0.2, 0.32, 0.44, 0.56, 0.68];

  return (
    // 500vh ≈ 100vh par étape (splash, fade, 3×features scroll, unpin)
    <div ref={containerRef} className="relative" style={{ height: '500vh' }}>
      {/* Sticky wrapper — occupe tout le viewport, se fixe pendant le scroll */}
      <div className="sticky top-0 h-screen overflow-x-clip">
        {/* Titre — en haut du viewport sous la navbar */}
        <motion.div
          className="px-4 pt-[12vh] text-center sm:px-6 lg:px-8"
          style={{ opacity: titleOpacity }}
        >
          <h1 className="mx-auto max-w-3xl font-[Space_Grotesk] text-3xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            L'éditeur pensé pour{" "}
            <span className="text-primary">l'écriture théâtrale.</span>
          </h1>
        </motion.div>

        {/* Démo + annotations — centrée verticalement, pull-up au scroll */}
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative w-full max-w-5xl"
            style={{ y: demoOffset }}
          >
            <FeatureAnnotationsController
              scrollYProgress={scrollYProgress}
              thresholds={featureThresholds}
            />
            <DemoEditor />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureAnnotationsController({ scrollYProgress, thresholds }) {
  const visibleCount = useVisibleCount(scrollYProgress, thresholds);
  return <FeatureAnnotations visibleCount={visibleCount} />;
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
