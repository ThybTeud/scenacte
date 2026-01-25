import { api } from './api';

export const bugReportsService = {
  async create(data) {
    return api.post('/bug-reports', data);
  },
};
