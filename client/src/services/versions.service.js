import { api } from './api';

export const versionsService = {
  async listVersions(playId, params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    return api.get(`/plays/${playId}/versions${queryString ? `?${queryString}` : ''}`);
  },

  async getVersion(playId, versionId) {
    return api.get(`/plays/${playId}/versions/${versionId}`);
  },

  async restoreVersion(playId, versionId) {
    return api.post(`/plays/${playId}/versions/restore`, { versionId });
  },

  async createManualVersion(playId, manualLabel) {
    return api.post(`/plays/${playId}/versions/manual`, { manualLabel });
  },
};
