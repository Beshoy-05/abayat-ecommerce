import { apiClient } from './client';
import { UserProfile } from '@/types/api';

export interface UpdateProfilePayload {
  displayName: string;
  phoneNumber?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const accountService = {
  // GET /api/Account/profile
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>('/api/Account/profile');
    return res.data;
  },

  // PUT /api/Account/profile
  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const res = await apiClient.put<UserProfile>('/api/Account/profile', payload);
    return res.data;
  },

  // PUT /api/Account/change-password
  changePassword: async (payload: ChangePasswordPayload): Promise<{ message?: string }> => {
    const res = await apiClient.put<{ message?: string }>('/api/Account/change-password', payload);
    return res.data;
  },

  // DELETE /api/Account
  deleteAccount: async (password: string): Promise<void> => {
    await apiClient.delete('/api/Account', { data: { password } });
  },
};
