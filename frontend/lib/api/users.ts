import { api } from './client';
import type { User } from './auth';

export interface UpdateProfileData {
  fullName?: string;
  currency?: string;
  language?: string;
  themeMode?: 'light' | 'dark';
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch('/users/me', data);
    return response.data.data;
  },
};
