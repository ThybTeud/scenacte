import { api } from './api';

export const playsService = {
  async listPlays(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    return api.get(`/plays${queryString ? `?${queryString}` : ''}`);
  },

  async createPlay(data) {
    return api.post('/plays', data);
  },

  async getPlay(id) {
    return api.get(`/plays/${id}`);
  },

  async savePlay(id, data) {
    return api.put(`/plays/${id}`, data);
  },

  async deletePlay(id) {
    return api.delete(`/plays/${id}`);
  },

  async updatePlayStatus(id, status) {
    return api.patch(`/plays/${id}/status`, { status });
  },
};
