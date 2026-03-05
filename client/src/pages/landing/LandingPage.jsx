import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroDemoSection from '@/components/landing/HeroDemoSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TargetsSection from '@/components/landing/TargetsSection';
import CtaFooterSection from '@/components/landing/CtaFooterSection';

export default function LandingPage() {
  document.title = 'Scenacte — L\'éditeur pensé pour l\'écriture théâtrale';

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroDemoSection />
      <FeaturesSection />
      <TargetsSection />
      <CtaFooterSection />
    </div>
  );
}
