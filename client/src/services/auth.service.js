import { api } from './api';

export const authService = {
  async register(email, password) {
    const response = await api.post('/auth/register', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token, newPassword) {
    return api.post('/auth/reset-password', { token, newPassword });
  },

  async getCurrentUser() {
    return api.get('/auth/me');
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
