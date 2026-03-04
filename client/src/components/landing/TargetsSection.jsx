import { Theater, GraduationCap, Users } from 'lucide-react';

const TARGETS = [
  {
    icon: Theater,
    label: 'Acteurs',
    description: 'Annotez vos textes, repérez vos répliques, travaillez votre rôle.',
  },
  {
    icon: GraduationCap,
    label: 'Enseignants',
    description: 'Un outil simple pour vos ateliers d\'écriture dramatique.',
  },
  {
    icon: Users,
    label: 'Compagnies',
    description: 'Partagez et exportez vos textes dans un format professionnel.',
  },
];

export default function TargetsSection() {
  return (
    <section className="bg-white/60 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center font-[Space_Grotesk] text-2xl font-bold text-black sm:text-3xl">
          Pensé pour tous les gens de théâtre
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {TARGETS.map(({ icon: Icon, label, description }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-sm border-2 border-black bg-white p-6 text-center shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active"
            >
              <div className="flex size-12 items-center justify-center rounded-sm border-2 border-black bg-primary/10">
                <Icon className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-black">{label}</h3>
              <p className="text-sm leading-relaxed text-black/70">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
