import { Code, Eye, FileText, History } from 'lucide-react';

const FEATURES = [
  {
    icon: Code,
    title: 'Syntaxe simplifiée',
    description: 'Un @ pour un personnage, un # pour un acte. Écrivez, Scenacte structure.',
  },
  {
    icon: Eye,
    title: 'Preview temps réel',
    description: 'Votre texte se met en forme au fil de la frappe. Didascalies, répliques, personnages\u00a0: tout est à sa place.',
  },
  {
    icon: FileText,
    title: 'Export PDF professionnel',
    description: 'Un clic, un PDF prêt à envoyer. Typographie, marges, pagination\u00a0: aux normes éditoriales.',
  },
  {
    icon: History,
    title: 'Versioning automatique',
    description: 'Chaque version de votre texte est sauvegardée. Revenez en arrière à tout moment.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white/60 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center font-[Space_Grotesk] text-2xl font-bold text-black sm:text-3xl">
          Tout ce qu'il faut pour écrire du théâtre
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-sm border-2 border-black bg-white p-6 shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-sm border-2 border-black bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-black">{title}</h3>
              <p className="text-sm leading-relaxed text-black/70">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
