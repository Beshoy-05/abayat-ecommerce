import { apiClient } from './client';
import { ReviewsResponse } from '@/types/api';

export interface CreateReviewPayload {
  productId: number;
  stars: number;
  message: string;
}

export const reviewsService = {
  // GET /api/Reviews/product/{productId}
  getProductReviews: async (productId: number | string): Promise<ReviewsResponse> => {
    const res = await apiClient.get<ReviewsResponse>(`/api/Reviews/product/${productId}`);
    return res.data;
  },

  // POST /api/Reviews
  createReview: async (payload: CreateReviewPayload): Promise<void> => {
    await apiClient.post('/api/Reviews', payload);
  },

  // PUT /api/Reviews/{id}
  updateReview: async (id: number, payload: { stars: number; message: string }): Promise<void> => {
    await apiClient.put(`/api/Reviews/${id}`, payload);
  },

  // DELETE /api/Reviews/{id}
  deleteReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/Reviews/${id}`);
  },
};
