import { useState, useEffect } from 'react';
import { useServerStatus } from '@/hooks/useServerStatus';

export default function ServerStatusBanner() {
  const { isServerReady, startTime } = useServerStatus();
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(false);

  // Afficher le bandeau après 2s si le serveur n'est pas prêt
  useEffect(() => {
    if (isServerReady) return;

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [isServerReady]);

  // Compteur de secondes écoulées
  useEffect(() => {
    if (isServerReady || !visible) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isServerReady, visible, startTime]);

  if (isServerReady || !visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary/10 border-b-2 border-primary">
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-foreground/80">
          Serveur en cours de démarrage...
          {elapsed > 5 && (
            <span className="text-muted-foreground ml-1">({elapsed}s)</span>
          )}
        </span>
      </div>
      <div className="h-0.5 bg-primary/20">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(95, (elapsed / 45) * 100)}%` }}
        />
      </div>
    </div>
  );
}
