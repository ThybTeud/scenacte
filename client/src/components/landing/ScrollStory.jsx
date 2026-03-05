import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import DemoEditor from '@/components/landing/DemoEditor';
import FeatureOverlay from '@/components/landing/FeatureOverlay';

/**
 * ScrollStory — orchestrates the scroll-driven narrative:
 *
 * Phase 1 (0–10%):   Title visible, demo below
 * Phase 2 (10–20%):  Title fades out, demo sticks
 * Phase 3 (20–85%):  Demo sticky, feature overlays appear cumulatively
 * Phase 4 (85–100%): Demo unpins, scrolls away
 *
 * The tall container (500vh) creates scroll runway for the sticky behavior.
 */
export default function ScrollStory() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Title opacity: visible at 0%, gone by 15%
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Feature overlay count (0–5) mapped to scroll progress
  const featureThresholds = [0.2, 0.32, 0.44, 0.56, 0.68];

  return (
    <div ref={containerRef} className="relative" style={{ height: '500vh' }}>
      {/* Sticky wrapper — sticks for the full scroll journey */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Title — fades out on scroll */}
          <motion.div
            className="mb-8 max-w-3xl text-center"
            style={{ opacity: titleOpacity }}
          >
            <h1 className="font-[Space_Grotesk] text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              L'éditeur pensé pour{" "}
              <span className="text-primary">l'écriture théâtrale.</span>
            </h1>
          </motion.div>

          {/* Demo + feature overlays */}
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

/**
 * Reads scroll progress and computes visible overlay count.
 * Separated to avoid re-rendering the entire sticky container.
 */
function FeatureOverlayController({ scrollYProgress, thresholds }) {
  const visibleCount = useVisibleCount(scrollYProgress, thresholds);
  return <FeatureOverlay visibleCount={visibleCount} />;
}

/**
 * Custom hook: maps scrollYProgress to a discrete count based on thresholds.
 */
function useVisibleCount(scrollYProgress, thresholds) {
  // We need to subscribe to the motion value to get reactive updates
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
