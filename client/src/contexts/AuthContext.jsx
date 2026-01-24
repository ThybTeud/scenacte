import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/auth.service';
import { storageService } from '../services/storage.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(() => {
    return localStorage.getItem('scenacte_guest_mode') === 'true';
  });

  // Persister le mode invité
  useEffect(() => {
    if (guestMode) {
      localStorage.setItem('scenacte_guest_mode', 'true');
    }
  }, [guestMode]);

  // Écouter les déconnexions forcées depuis api.js (401)
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          authService.logout();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    loadUser();
  }, [token]);

  const enableGuestMode = useCallback(() => {
    setGuestMode(true);
  }, []);

  const disableGuestMode = useCallback(() => {
    setGuestMode(false);
    localStorage.removeItem('scenacte_guest_mode');
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    setToken(response.token);
    setUser(response.user);
    disableGuestMode();
    return response;
  }, [disableGuestMode]);

  const register = useCallback(async (email, password) => {
    // Compter les pièces invité avant l'inscription
    const guestPlaysCount = storageService.getGuestPlaysCount();

    // Inscription
    const response = await authService.register(email, password);
    setToken(response.token);
    setUser(response.user);
    disableGuestMode();

    // Migration automatique des pièces invité
    if (guestPlaysCount > 0) {
      try {
        await storageService.migrateGuestData();
        // Stocker le succès pour affichage dans LibraryPage
        sessionStorage.setItem('scenacte_import_success', guestPlaysCount.toString());
      } catch (error) {
        console.error('[AuthContext] Erreur migration:', error);
        // On continue même si la migration échoue
      }
    }

    return response;
  }, [disableGuestMode]);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token && !!user,
    isGuest: guestMode && !token && !user,
    guestMode,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    enableGuestMode,
    disableGuestMode,
  }), [user, token, guestMode, isLoading, login, register, logout, updateUser, enableGuestMode, disableGuestMode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
