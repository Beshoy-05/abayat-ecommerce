import { apiClient } from './client';
import { DeliveryMethod } from '@/types/api';

export const deliveryService = {
  // GET /api/DeliveryMethods
  getDeliveryMethods: async (): Promise<DeliveryMethod[]> => {
    const res = await apiClient.get<DeliveryMethod[]>('/api/DeliveryMethods');
    return res.data;
  },

  // POST /api/DeliveryMethods (Admin only)
  createDeliveryMethod: async (payload: { shortName: string; description: string; deliveryTime: string; cost: number }): Promise<number> => {
    const res = await apiClient.post<number>('/api/DeliveryMethods', payload);
    return res.data;
  },

  // PUT /api/DeliveryMethods/{id} (Admin only)
  updateDeliveryMethod: async (
    id: number | string,
    payload: { shortName: string; description: string; deliveryTime: string; cost: number }
  ): Promise<void> => {
    try {
      await apiClient.put(`/api/DeliveryMethods/${id}`, { ...payload, id: Number(id) });
    } catch {
      // Fallback in case endpoint expects root path with id in payload
      await apiClient.put('/api/DeliveryMethods', { ...payload, id: Number(id) });
    }
  },

  // DELETE /api/DeliveryMethods/{id} (Admin only)
  deleteDeliveryMethod: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/DeliveryMethods/${id}`);
  },
};


