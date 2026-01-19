import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function GuestModeBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <Alert variant="warning" className="mb-4 flex items-center justify-between gap-4">
      <AlertDescription className="flex-1 font-ui">
        <strong>Mode invité</strong> — vos pièces sont stockées localement dans
        votre navigateur.{' '}
        <button
          onClick={() => navigate('/register')}
          className="text-orange hover:underline font-medium"
        >
          Créer un compte
        </button>{' '}
        pour synchroniser vos pièces et y accéder depuis tous vos appareils.
      </AlertDescription>
      <button
        onClick={() => setIsVisible(false)}
        className="text-black/60 hover:text-black transition-colors"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>
    </Alert>
  );
}
