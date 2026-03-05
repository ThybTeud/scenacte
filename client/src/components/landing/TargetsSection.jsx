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
    <section className="border-y-2 border-border bg-muted/50 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center font-[Space_Grotesk] text-2xl font-bold text-foreground sm:text-3xl">
          Pensé pour tous les gens de théâtre
        </h2>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
          {TARGETS.map(({ icon: Icon, label, description }) => (
            <div key={label} className="flex flex-1 items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
