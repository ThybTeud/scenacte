import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Theater,
  Clapperboard,
  Users,
  MessageSquare,
  Type,
  Clock,
} from 'lucide-react';

const statItems = [
  { key: 'totalActs', label: 'Actes', icon: Theater, color: 'text-amber-600' },
  { key: 'totalScenes', label: 'Scènes', icon: Clapperboard, color: 'text-rose-600' },
  { key: 'totalCharacters', label: 'Personnages', icon: Users, color: 'text-blue-600' },
  { key: 'totalRepliques', label: 'Répliques', icon: MessageSquare, color: 'text-emerald-600' },
  { key: 'wordCount', label: 'Mots', icon: Type, color: 'text-violet-600' },
  { key: 'estimatedDurationMinutes', label: 'Durée estimée', icon: Clock, color: 'text-orange-600', suffix: ' min' },
];

/**
 * Modal de statistiques détaillées de la pièce ouverte.
 *
 * @param {boolean} isOpen - Contrôle l'affichage du modal
 * @param {Function} onClose - Callback de fermeture
 * @param {Object} statistics - Statistiques calculées depuis l'AST
 * @param {string} playTitle - Titre de la pièce
 */
export default function StatsModal({ isOpen, onClose, statistics, playTitle }) {
  const safeStats = statistics || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Statistiques</DialogTitle>
          <DialogDescription>
            {playTitle || 'Pièce sans titre'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {statItems.map(({ key, label, icon: Icon, color, suffix }) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-lg border-2 border-gray-900 p-3"
            >
              <Icon className={`h-5 w-5 shrink-0 ${color}`} />
              <div className="min-w-0">
                <p className={`text-xl font-bold ${color}`}>
                  {safeStats[key] ?? 0}{suffix || ''}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
