import { useEffect } from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroDemoSection from '@/components/landing/HeroDemoSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TargetsSection from '@/components/landing/TargetsSection';
import CtaFooterSection from '@/components/landing/CtaFooterSection';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Scenacte — L\'éditeur pensé pour l\'écriture théâtrale';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNavbar />
      <HeroDemoSection />
      <FeaturesSection />
      <TargetsSection />
      <CtaFooterSection />
    </div>
  );
}
