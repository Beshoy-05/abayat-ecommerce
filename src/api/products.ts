import { apiClient } from './client';
import { PaginatedList, Product, ProductFilterParams } from '@/types/api';

export const productsService = {
  // GET /api/Products
  getProducts: async (params?: ProductFilterParams): Promise<PaginatedList<Product>> => {
    const cleanParams: Record<string, string | number> = {};

    if (params?.pageIndex) cleanParams.pageIndex = params.pageIndex;
    if (params?.pageSize) cleanParams.pageSize = params.pageSize;
    if (params?.categoryId) cleanParams.categoryId = params.categoryId;
    if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
    if (params?.color && params.color.trim()) cleanParams.color = params.color.trim();
    if (params?.size && params.size.trim()) cleanParams.size = params.size.trim();
    if (params?.minPrice !== undefined && params?.minPrice !== null) cleanParams.minPrice = params.minPrice;
    if (params?.maxPrice !== undefined && params?.maxPrice !== null) cleanParams.maxPrice = params.maxPrice;
    if (params?.sortingOption) cleanParams.sortingOption = params.sortingOption;

    const res = await apiClient.get<PaginatedList<Product>>('/api/Products', {
      params: cleanParams,
    });
    return res.data;
  },

  // GET /api/Products/{id}
  getProductById: async (id: number | string): Promise<Product> => {
    const res = await apiClient.get<Product>(`/api/Products/${id}`);
    return res.data;
  },

  // POST /api/Products (Admin only)
  createProduct: async (payload: any): Promise<number> => {
    const res = await apiClient.post<number>('/api/Products', payload);
    return res.data;
  },

  // PUT /api/Products/{id} (Admin only - Edit product endpoint)
  updateProduct: async (id: number | string, payload: any): Promise<any> => {
    const cleanId = Number(id);
    const res = await apiClient.put(`/api/Products/${cleanId}`, {
      ...payload,
      id: cleanId,
    });
    return res.data;
  },

  // DELETE /api/Products/{id} (Admin only)
  deleteProduct: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/api/Products/${id}`);
  },
};

