import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import Logo from './ui/Logo';
import { useServerStatus } from '@/hooks/useServerStatus';

const EXPECTED_DURATION = 45; // secondes estimées pour un cold start

function getMessage(elapsed) {
  if (elapsed < 5) return "Réveil du serveur en cours...";
  if (elapsed < 15) return "Hébergement éco-responsable — le serveur dort quand personne ne l'utilise";
  if (elapsed < 30) return "Encore quelques secondes... (~30s au total)";
  return "Plus long que d'habitude, merci de patienter";
}

function getProgress(elapsed) {
  // Progression asymptotique : rapide au début, ralentit vers 90%
  // Formule : 90 * (1 - e^(-elapsed/20))
  return Math.min(90, 90 * (1 - Math.exp(-elapsed / 20)));
}

export default function ServerWakeUp() {
  const { isServerReady, startTime } = useServerStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);

  // Afficher après 2s si serveur pas prêt
  useEffect(() => {
    if (isServerReady) return;

    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [isServerReady]);

  // Mise à jour du compteur et de la progression
  useEffect(() => {
    if (isServerReady) {
      setProgress(100);
      return;
    }
    if (!isVisible) return;

    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(secs);
      setProgress(getProgress(secs));
    }, 500);

    return () => clearInterval(interval);
  }, [isServerReady, isVisible, startTime]);

  // Animation de sortie : laisser la barre atteindre 100% puis disparaître
  useEffect(() => {
    if (!isServerReady || !isVisible) return;

    const timer = setTimeout(() => setIsVisible(false), 600);
    return () => clearTimeout(timer);
  }, [isServerReady, isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${isServerReady ? 'opacity-0' : 'opacity-100'}`}>
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-6 flex flex-col items-center gap-5">
          {/* Logo */}
          <Logo size={40} />

          {/* Message contextuel */}
          <div className="text-center space-y-1">
            <p className="text-muted-foreground text-sm">
              {getMessage(elapsed)}
            </p>
            {elapsed >= 3 && !isServerReady && (
              <p className="text-muted-foreground/60 text-xs">
                {elapsed}s écoulées · estimation ~{EXPECTED_DURATION}s
              </p>
            )}
          </div>

          {/* Barre de progression déterminée */}
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Lien vers le mode test */}
          {elapsed >= 8 && !isServerReady && (
            <p className="text-xs text-muted-foreground/70 text-center">
              Envie d'essayer l'éditeur en attendant ?{' '}
              <a
                href="/test"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Mode test
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
