import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function CtaFooterSection() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[Space_Grotesk] text-2xl font-bold text-foreground sm:text-3xl">
            Prêt à écrire votre prochaine pièce ?
          </h2>

          <div className="mt-8">
            {isAuthenticated ? (
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active">
                <Link to="/library">
                  Aller à ma bibliothèque
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active">
                <Link to="/register">
                  Créer ma première pièce
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Logo variant="full" />

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/legal/cgu" className="transition-colors hover:text-primary">CGU</Link>
            <Link to="/legal/privacy" className="transition-colors hover:text-primary">Confidentialité</Link>
            <Link to="/legal/mentions" className="transition-colors hover:text-primary">Mentions légales</Link>
            {!isAuthenticated && (
              <Link to="/login" className="transition-colors hover:text-primary">Connexion</Link>
            )}
          </nav>
        </div>
      </footer>
    </>
  );
}
