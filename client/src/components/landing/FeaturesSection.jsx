import { Code, Eye, FileText, History } from 'lucide-react';

const FEATURES = [
  {
    icon: Code,
    title: 'Syntaxe simplifiée',
    description: 'Un @ pour un personnage, un # pour un acte. Écrivez, Scenacte structure.',
    primary: true,
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
    <section className="px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center font-[Space_Grotesk] text-2xl font-bold text-foreground sm:text-3xl">
          Tout ce qu'il faut pour écrire du théâtre
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description, primary }) => (
            <div
              key={title}
              className={`rounded-sm border-2 border-border bg-card shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active ${
                primary ? 'sm:col-span-2 p-8' : 'p-6'
              }`}
            >
              <div className={`mb-4 flex items-center justify-center rounded-sm border-2 border-border bg-primary/10 ${
                primary ? 'size-14' : 'size-11'
              }`}>
                <Icon className={primary ? 'size-7 text-primary' : 'size-5 text-primary'} />
              </div>
              <h3 className={`mb-2 font-semibold text-foreground ${primary ? 'text-xl' : 'text-lg'}`}>
                {title}
              </h3>
              <p className={`leading-relaxed text-muted-foreground ${primary ? 'text-base' : 'text-sm'}`}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
