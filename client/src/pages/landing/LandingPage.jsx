import { useEffect } from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import ScrollStory from '@/components/landing/ScrollStory';
import TargetsIllustration from '@/components/landing/TargetsIllustration';
import CtaFooterSection from '@/components/landing/CtaFooterSection';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Scenacte — L\'éditeur pensé pour l\'écriture théâtrale';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNavbar />
      <ScrollStory />
      <TargetsIllustration />
      <CtaFooterSection />
    </div>
  );
}
