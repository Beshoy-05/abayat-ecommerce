import { apiClient } from './client';
import { Cart } from '@/types/api';

export interface AddToCartPayload {
  productVariantId: number;
  quantity: number;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
}

export const cartService = {
  // GET /api/Carts
  getCart: async (): Promise<Cart> => {
    const res = await apiClient.get<Cart>('/api/Carts');
    return res.data;
  },

  // POST /api/Carts/items
  // Strict Golden Rule #2 & #4: sends ONLY productVariantId & quantity
  addToCart: async (payload: AddToCartPayload): Promise<AddToCartResponse> => {
    const res = await apiClient.post<AddToCartResponse>('/api/Carts/items', {
      productVariantId: payload.productVariantId,
      quantity: payload.quantity,
    });
    return res.data;
  },

  // DELETE /api/Carts/items/{cartItemId}
  removeCartItem: async (cartItemId: number): Promise<void> => {
    await apiClient.delete(`/api/Carts/items/${cartItemId}`);
  },
};
