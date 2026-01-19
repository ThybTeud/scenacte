import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export function GuestModeBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-2 border-yellow-500 rounded px-4 py-3 mb-4 flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-ui text-black">
          <strong>Mode invité</strong> — vos pièces sont stockées localement dans
          votre navigateur.{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-orange hover:underline font-medium"
          >
            Créer un compte
          </button>{' '}
          pour synchroniser vos pièces et y accéder depuis tous vos appareils.
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-black/60 hover:text-black transition-colors"
        aria-label="Fermer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
