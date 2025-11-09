import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

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

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const register = async (email, username, password) => {
    const response = await authService.register(email, username, password);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
