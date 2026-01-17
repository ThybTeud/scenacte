import { api } from './api';

// URL de base pour l'API (sans auth pour les templates publics)
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export const templatesService = {
  /**
   * Récupère les templates publics (système)
   * Ne nécessite pas d'authentification
   */
  async getPublicTemplates() {
    const response = await fetch(`${API_URL}/templates/public`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors du chargement des templates');
    }

    return response.json();
  },

  /**
   * Récupère tous les templates (utilisateur + système)
   * Nécessite une authentification
   */
  async listTemplates(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.playId) queryParams.append('playId', params.playId);

    const queryString = queryParams.toString();
    return api.get(`/templates${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Récupère un template par ID
   */
  async getTemplate(id) {
    return api.get(`/templates/${id}`);
  },

  /**
   * Crée un nouveau template
   */
  async createTemplate(data) {
    return api.post('/templates', data);
  },

  /**
   * Met à jour un template
   */
  async updateTemplate(id, data) {
    return api.put(`/templates/${id}`, data);
  },

  /**
   * Supprime un template
   */
  async deleteTemplate(id) {
    return api.delete(`/templates/${id}`);
  },
};
