import { apiClient } from './client';
import { ReviewsResponse, GetReviewesQueryParameter } from '@/types/api';

export interface CreateReviewPayload {
  productId: number;
  stars: number;
  message: string;
}

export const reviewsService = {
  // GET /api/Reviews/product/{productId}
  getProductReviews: async (
    productId: number | string,
    params?: GetReviewesQueryParameter
  ): Promise<ReviewsResponse> => {
    const cleanParams: Record<string, string | number> = {};
    if (params?.pageIndex) cleanParams.pageIndex = params.pageIndex;
    if (params?.pageSize) cleanParams.pageSize = params.pageSize;
    if (params?.sortingOption) cleanParams.sortingOption = params.sortingOption;

    const res = await apiClient.get<ReviewsResponse>(`/api/Reviews/product/${productId}`, {
      params: cleanParams,
    });
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
