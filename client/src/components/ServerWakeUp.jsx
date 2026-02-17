import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import Logo from './ui/Logo';

const MESSAGES = [
  "Réveil du serveur...",
  "Préparation de l'éditeur...",
  "Encore quelques secondes..."
];

const PING_INTERVAL = 2000; // 2 secondes
const MESSAGE_ROTATION_INTERVAL = 5000; // 5 secondes
const INITIAL_DELAY = 2000; // 2 secondes avant d'afficher l'écran

export default function ServerWakeUp({ onReady }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [serverReady, setServerReady] = useState(false);
  const onReadyRef = useRef(onReady);

  // Garder la ref à jour sans déclencher l'effet
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    let mounted = true;
    let visibilityTimer = null;
    let pingInterval = null;
    let messageInterval = null;

    // Fonction pour vérifier le health check
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok && mounted) {
          setServerReady(true);
          clearTimeout(visibilityTimer);
          clearInterval(pingInterval);
          clearInterval(messageInterval);

          // Notifier le parent que le serveur est prêt
          onReadyRef.current?.();
          return true;
        }
      } catch (error) {
        // Le serveur n'est pas encore prêt
        return false;
      }
      return false;
    };

    // Démarrer le timer de visibilité immédiatement,
    // sans attendre la résolution du premier fetch
    visibilityTimer = setTimeout(() => {
      if (mounted) {
        setIsVisible(true);
      }
    }, INITIAL_DELAY);

    // Premier ping immédiat
    checkHealth();

    // Démarrer le ping toutes les 2 secondes
    pingInterval = setInterval(checkHealth, PING_INTERVAL);

    // Démarrer la rotation des messages toutes les 5 secondes
    messageInterval = setInterval(() => {
      if (mounted) {
        setCurrentMessageIndex(prev => (prev + 1) % MESSAGES.length);
      }
    }, MESSAGE_ROTATION_INTERVAL);

    // Cleanup
    return () => {
      mounted = false;
      clearTimeout(visibilityTimer);
      clearInterval(pingInterval);
      clearInterval(messageInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ne rien afficher si le serveur est prêt ou si on n'a pas dépassé les 2 sec
  if (serverReady || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-6 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo size={40} />
          </div>

          {/* Message rotatif */}
          <p className="text-center text-muted-foreground animate-pulse">
            {MESSAGES[currentMessageIndex]}
          </p>

          {/* Barre de progression indéterminée */}
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary rounded-full animate-loading-bar" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
