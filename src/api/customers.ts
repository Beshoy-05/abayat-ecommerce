import { apiClient } from './client';
import { CustomerDto, PaginatedList } from '@/types/api';

export const customersService = {
  // GET /api/Customers (Admin only)
  getCustomers: async (pageIndex = 1, pageSize = 20): Promise<PaginatedList<CustomerDto>> => {
    const res = await apiClient.get<PaginatedList<CustomerDto>>('/api/Customers', {
      params: { pageIndex, pageSize },
    });
    return res.data;
  },

  // POST /api/Customers/{userId}/roles/{role} (Admin only)
  assignRole: async (userId: number | string, role: string = 'Admin'): Promise<void> => {
    try {
      await apiClient.post(`/api/Customers/${userId}/roles/${role}`);
    } catch {
      // Fallback in case backend requires alternate casing (e.g. 'admin' vs 'Admin')
      const altRole = role.toLowerCase() === 'admin' ? (role === 'admin' ? 'Admin' : 'admin') : role;
      await apiClient.post(`/api/Customers/${userId}/roles/${altRole}`);
    }
  },

  // DELETE /api/Customers/{userId}/roles/{role} (Admin only)
  removeRole: async (userId: number | string, role: string = 'Admin'): Promise<void> => {
    try {
      await apiClient.delete(`/api/Customers/${userId}/roles/${role}`);
    } catch {
      const altRole = role.toLowerCase() === 'admin' ? (role === 'admin' ? 'Admin' : 'admin') : role;
      await apiClient.delete(`/api/Customers/${userId}/roles/${altRole}`);
    }
  },
};
