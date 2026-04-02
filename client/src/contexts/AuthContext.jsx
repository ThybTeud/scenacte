import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '@/services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

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

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    setToken(response.token);
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async (email, password) => {
    const response = await authService.register(email, password);
    setToken(response.token);
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  }, []);

  const loginWithToken = useCallback(async (token) => {
    localStorage.setItem('token', token);
    const response = await authService.getCurrentUser();
    setToken(token);
    setUser(response.user);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    loginWithToken,
  }), [user, token, isLoading, login, register, logout, updateUser, loginWithToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
