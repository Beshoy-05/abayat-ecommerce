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

  // GET /api/Orders/all (Admin only: returns PaginatedList<OrderDto>)
  getAllOrders: async (pageIndex = 1, pageSize = 20): Promise<{ data: Order[]; totalCount: number; totalPages: number }> => {
    let res: { data: unknown };
    try {
      res = await apiClient.get<unknown>(`/api/Orders/all?pageIndex=${pageIndex}&pageSize=${pageSize}`);
    } catch {
      // Fallback in case endpoint was routed without /all
      res = await apiClient.get<unknown>(`/api/Orders?pageIndex=${pageIndex}&pageSize=${pageSize}`);
    }
    // Handle both PaginatedList format and direct array
    const responseData = res.data as { data?: Order[]; totalCount?: number; totalPages?: number } | Order[];
    if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
      return {
        data: responseData.data,
        totalCount: responseData.totalCount || responseData.data.length,
        totalPages: responseData.totalPages || 1,
      };
    }
    if (Array.isArray(responseData)) {
      return {
        data: responseData,
        totalCount: responseData.length,
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

  // PUT /api/Orders/{id}/cancel (Admin Rejection - triggers backend isRejected = true)
  rejectOrder: async (id: number | string, reason?: string): Promise<void> => {
    const rawReason = reason?.trim() || 'رفض الطلب بواسطة الإدارة';
    const formattedReason = rawReason.toLowerCase().includes('reject')
      ? rawReason
      : `${rawReason} (reject)`;
    await apiClient.put(`/api/Orders/${id}/cancel`, { reason: formattedReason });
  },
};

