import { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import DemoEditor from '@/components/landing/DemoEditor';
import FeatureOverlay from '@/components/landing/FeatureOverlay';

/**
 * ScrollStory — orchestrates the scroll-driven narrative:
 *
 * Phase 1:  Title visible in normal flow, demo below
 * Phase 2:  Title scrolls away naturally, demo sticks centered vertically
 * Phase 3:  Demo sticky, feature overlays appear cumulatively
 * Phase 4:  Demo unpins, scrolls away
 *
 * The tall container (500vh) creates scroll runway for the sticky behavior.
 */
export default function ScrollStory() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const featureThresholds = [0.2, 0.32, 0.44, 0.56, 0.68];

  return (
    <div ref={containerRef} className="relative" style={{ height: '500vh' }}>
      {/* Title — in normal flow, scrolls out naturally */}
      <div className="px-4 pt-24 pb-8 sm:px-6 md:pt-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-[Space_Grotesk] text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            L'éditeur pensé pour{" "}
            <span className="text-primary">l'écriture théâtrale.</span>
          </h1>
        </div>
      </div>

      {/* Sticky demo — pins and centers vertically once title scrolls away */}
      <div className="sticky top-0 z-10 flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-5xl">
          <FeatureOverlayController
            scrollYProgress={scrollYProgress}
            thresholds={featureThresholds}
          />
          <DemoEditor />
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
