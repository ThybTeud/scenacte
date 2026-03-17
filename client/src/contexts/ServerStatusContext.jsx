import { createContext, useState, useEffect, useRef, useCallback } from 'react';

const PING_INTERVAL = 2000;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ServerStatusContext = createContext(null);

export function ServerStatusProvider({ children }) {
  const [isServerReady, setIsServerReady] = useState(false);
  const [startTime] = useState(Date.now());
  const mountedRef = useRef(true);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok && mountedRef.current) {
        setIsServerReady(true);
        return true;
      }
    } catch {
      // Serveur pas encore prêt
    }
    return false;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Premier ping immédiat
    checkHealth();

    const interval = setInterval(async () => {
      const ready = await checkHealth();
      if (ready) clearInterval(interval);
    }, PING_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [checkHealth]);

  return (
    <ServerStatusContext.Provider value={{ isServerReady, startTime }}>
      {children}
    </ServerStatusContext.Provider>
  );
}
