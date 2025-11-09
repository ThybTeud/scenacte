import { api } from './api';

export const usersService = {
  async getProfile() {
    return api.get('/users/profile');
  },

  async updateProfile(data) {
    return api.put('/users/profile', data);
  },

  async deleteAccount(password) {
    return api.delete('/users/account', { password });
  },
};
