import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-16 sm:px-6 md:pt-32 md:pb-24 lg:px-8">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-12 left-8 h-24 w-24 rotate-12 rounded-sm border-2 border-black/10 bg-primary/5" />
        <div className="absolute right-12 bottom-24 h-32 w-32 -rotate-6 rounded-sm border-2 border-black/10 bg-blue/5" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-[Space_Grotesk] text-4xl font-bold tracking-tight text-black sm:text-5xl md:text-6xl">
          L'éditeur pensé pour{' '}
          <span className="text-primary">l'écriture théâtrale.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/70 sm:text-xl">
          Scenacte est le premier éditeur dédié à l'écriture dramatique en français. Syntaxe simplifiée, mise en page automatique, export PDF professionnel.
        </p>

        <div className="mt-10">
          {isAuthenticated ? (
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active transition-all">
              <Link to="/library">
                Aller à ma bibliothèque
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active transition-all">
              <Link to="/register">
                Créer ma première pièce
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Editor visual mockup */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="rounded-sm border-2 border-black bg-white shadow-brutal-lg overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b-2 border-black bg-cream px-4 py-2">
              <div className="h-3 w-3 rounded-full border-2 border-black bg-primary" />
              <div className="h-3 w-3 rounded-full border-2 border-black bg-yellow-400" />
              <div className="h-3 w-3 rounded-full border-2 border-black bg-green-400" />
              <span className="ml-2 font-mono text-xs text-black/50">scenacte — éditeur</span>
            </div>
            {/* Editor content mockup */}
            <div className="grid grid-cols-2 divide-x-2 divide-black">
              {/* Markup side */}
              <div className="p-4 sm:p-6 text-left font-[Source_Code_Pro,monospace] text-xs sm:text-sm leading-relaxed">
                <p className="text-primary font-semibold">#Acte I</p>
                <p className="text-primary font-semibold">##Scène 1</p>
                <p className="text-black/50 italic">(Un salon, fin d'après-midi.)</p>
                <p className="text-blue font-semibold mt-1">@ALICE</p>
                <p className="text-black/70">Tu crois qu'on peut encore changer ?</p>
              </div>
              {/* Preview side */}
              <div className="p-4 sm:p-6 text-left font-[Crimson_Text,Georgia,serif] text-xs sm:text-sm leading-relaxed">
                <p className="text-center font-bold uppercase text-sm sm:text-base tracking-wide">Acte I</p>
                <p className="text-center font-semibold uppercase text-xs sm:text-sm mt-1">Scène 1</p>
                <p className="italic text-black/60 mt-2">Un salon, fin d'après-midi.</p>
                <p className="font-semibold uppercase text-center mt-2 text-xs sm:text-sm">Alice</p>
                <p className="text-black/80 mt-0.5">Tu crois qu'on peut encore changer ?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
