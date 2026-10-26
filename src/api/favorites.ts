import { apiClient } from './client';
import { Product } from '@/types/api';

export const favoritesService = {
  // GET /api/Favorites
  getFavorites: async (): Promise<Product[]> => {
    const res = await apiClient.get<Product[]>('/api/Favorites');
    return res.data;
  },

  // POST /api/Favorites/toggle/{productId} -> returns boolean (true = added, false = removed)
  toggleFavorite: async (productId: number): Promise<boolean> => {
    const res = await apiClient.post<boolean>(`/api/Favorites/toggle/${productId}`);
    return res.data;
  },

  // GET /api/Favorites/check/{productId} -> returns boolean
  checkFavorite: async (productId: number): Promise<boolean> => {
    const res = await apiClient.get<boolean>(`/api/Favorites/check/${productId}`);
    return res.data;
  },

  // DELETE /api/Favorites/{productId}
  removeFavorite: async (productId: number): Promise<void> => {
    await apiClient.delete(`/api/Favorites/${productId}`);
  },
};
