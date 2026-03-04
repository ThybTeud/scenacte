import { Clock, HelpCircle, FileX } from 'lucide-react';

const PAIN_POINTS = [
  {
    icon: Clock,
    text: 'Des heures perdues à formater dans Word',
  },
  {
    icon: HelpCircle,
    text: 'Aucun outil ne connaît les conventions théâtrales',
  },
  {
    icon: FileX,
    text: 'Un export PDF qui ne ressemble jamais à un vrai texte édité',
  },
];

export default function PainPointsSection() {
  return (
    <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 sm:grid-cols-3">
          {PAIN_POINTS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-4 rounded-sm border-2 border-black bg-white p-5 shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-active"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-sm border-2 border-black bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <p className="text-sm font-medium leading-snug text-black sm:text-base">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
