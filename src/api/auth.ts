import { apiClient } from './client';
import { AuthResponse } from '@/types/api';

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  // POST /api/Auth/register
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/Auth/register', payload);
    return res.data;
  },

  // POST /api/Auth/login
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/api/Auth/login', payload);
    return res.data;
  },
};
