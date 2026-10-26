import { apiClient } from './client';
import { CreateOrderPayload, Order } from '@/types/api';

export const ordersService = {
  // POST /api/Orders
  // Strict Golden Rule #2, #3, #4: No unitPrice, no customerId, only productVariantId & quantity
  createOrder: async (payload: CreateOrderPayload): Promise<number> => {
    const res = await apiClient.post<number>('/api/Orders', {
      shippingAddress: payload.shippingAddress,
      items: payload.items.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      })),
      deliveryMethodId: payload.deliveryMethodId,
      paymentMethod: payload.paymentMethod || 'CashOnDelivery',
      paymentReceiptUrl: payload.paymentReceiptUrl || null,
      comments: payload.comments || '',
    });
    return res.data;
  },

  // GET /api/Orders
  getOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>('/api/Orders');
    return res.data;
  },

  // GET /api/Orders/{id}
  getOrderById: async (id: number | string): Promise<Order> => {
    const res = await apiClient.get<Order>(`/api/Orders/${id}`);
    return res.data;
  },

  // GET /api/Orders (Admin only: returns PaginatedList<OrderDto>)
  getAllOrders: async (pageIndex = 1, pageSize = 20): Promise<{ data: Order[]; totalCount: number; totalPages: number }> => {
    let res: any;
    try {
      res = await apiClient.get<any>(`/api/Orders?pageIndex=${pageIndex}&pageSize=${pageSize}`);
    } catch {
      // Fallback in case /api/Orders/all was previously routed
      res = await apiClient.get<any>(`/api/Orders/all?pageIndex=${pageIndex}&pageSize=${pageSize}`);
    }
    // Handle both PaginatedList format and direct array
    if (res.data && Array.isArray(res.data.data)) {
      return {
        data: res.data.data,
        totalCount: res.data.totalCount || res.data.data.length,
        totalPages: res.data.totalPages || 1,
      };
    }
    if (Array.isArray(res.data)) {
      return {
        data: res.data,
        totalCount: res.data.length,
        totalPages: 1,
      };
    }
    return { data: [], totalCount: 0, totalPages: 1 };
  },

  // PUT /api/Orders/{id}/approve (Admin only)
  approveOrder: async (id: number | string): Promise<void> => {
    await apiClient.put(`/api/Orders/${id}/approve`);
  },

  // PUT /api/Orders/{id}/cancel
  cancelOrder: async (id: number | string, reason?: string): Promise<void> => {
    await apiClient.put(`/api/Orders/${id}/cancel`, { reason });
  },
};

