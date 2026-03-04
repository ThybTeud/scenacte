import { lazy, Suspense } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import PainPointsSection from '@/components/landing/PainPointsSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TargetsSection from '@/components/landing/TargetsSection';
import CtaFooterSection from '@/components/landing/CtaFooterSection';

const DemoSection = lazy(() => import('@/components/landing/DemoSection'));

export default function LandingPage() {
  document.title = 'Scenacte — L\'éditeur pensé pour l\'écriture théâtrale';

  return (
    <div className="min-h-screen bg-cream">
      <HeroSection />
      <PainPointsSection />
      <FeaturesSection />
      <Suspense fallback={<div className="h-96" />}>
        <DemoSection />
      </Suspense>
      <TargetsSection />
      <CtaFooterSection />
    </div>
  );
}
