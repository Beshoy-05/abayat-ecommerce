import { apiClient } from './client';
import { Category } from '@/types/api';

export const categoriesService = {
  // GET /api/Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<Category[]>('/api/Categories');
    return res.data;
  },

  // GET /api/Categories/{id}
  getCategoryById: async (id: number | string): Promise<Category> => {
    const res = await apiClient.get<Category>(`/api/Categories/${id}`);
    return res.data;
  },

  // POST /api/Categories (Admin only)
  createCategory: async (name: string): Promise<number> => {
    const res = await apiClient.post<number>('/api/Categories', { name });
    return res.data;
  },

  // PUT /api/Categories/{id} (Admin only)
  updateCategory: async (id: number | string, name: string): Promise<void> => {
    await apiClient.put(`/api/Categories/${id}`, { id, name });
  },

  // DELETE /api/Categories/{id} (Admin only)
  deleteCategory: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/Categories/${id}`);
  },
};

