import { apiClient } from './client';
import { Product } from '@/types/api';

export const normalizeFavoriteToProduct = (rawItem: unknown): Product => {
  const item = (rawItem && typeof rawItem === 'object' ? rawItem : {}) as Record<string, unknown> & {
    product?: Record<string, unknown>;
  };
  if (!rawItem || typeof rawItem !== 'object') {
    return {
      id: 0,
      name: '',
      description: '',
      price: 0,
      finalPrice: 0,
      categoryId: 0,
      categoryName: '',
      images: [],
      variants: [],
      colorGroups: [],
    };
  }

  // 1. Identify Product ID (handles FavoriteDto with productId or Product with id)
  const id = Number(
    item.productId ??
    item.ProductId ??
    item.id ??
    item.Id ??
    item.product?.id ??
    item.product?.productId ??
    0
  );

  // 2. Identify Product Name
  const name = String(
    item.productName ??
    item.ProductName ??
    item.name ??
    item.Name ??
    item.product?.name ??
    item.title ??
    ''
  );

  // 3. Identify Price & Final Price
  const rawPrice =
    item.productPrice ??
    item.ProductPrice ??
    item.price ??
    item.Price ??
    item.finalPrice ??
    item.FinalPrice ??
    item.product?.price ??
    0;
  const price = Number(rawPrice) || 0;

  const rawFinalPrice =
    item.finalPrice ??
    item.FinalPrice ??
    item.productPrice ??
    item.ProductPrice ??
    item.price ??
    price;
  const finalPrice = Number(rawFinalPrice) || price;

  // 4. Identify Description
  const description = String(
    item.productDescription ??
    item.ProductDescription ??
    item.description ??
    item.Description ??
    item.product?.description ??
    ''
  );

  // 5. Category
  const categoryId = Number(
    item.categoryId ??
    item.CategoryId ??
    item.product?.categoryId ??
    0
  );
  const categoryName = String(
    item.categoryName ??
    item.CategoryName ??
    item.product?.categoryName ??
    ''
  );

  // 6. Picture URL & Images
  const pictureUrl = String(
    item.pictureUrl ??
    item.PictureUrl ??
    item.pictureURL ??
    item.imageUrl ??
    item.ImageUrl ??
    item.productImage ??
    item.product?.pictureUrl ??
    ''
  );

  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : Array.isArray(item.product?.images) && item.product.images.length > 0
    ? item.product.images
    : pictureUrl ? [pictureUrl] : [];

  return {
    id,
    name,
    description,
    price,
    discount: item.discount != null ? Number(item.discount) : item.Discount != null ? Number(item.Discount) : null,
    finalPrice: finalPrice > 0 ? finalPrice : price,
    categoryId,
    categoryName,
    pictureUrl: pictureUrl || undefined,
    images,
    variants: Array.isArray(item.variants)
      ? item.variants
      : Array.isArray(item.product?.variants)
      ? item.product.variants
      : [],
    colorGroups: Array.isArray(item.colorGroups)
      ? item.colorGroups
      : Array.isArray(item.product?.colorGroups)
      ? item.product.colorGroups
      : [],
  };
};

export const favoritesService = {
  // GET /api/Favorites -> maps FavoriteDto[] or Product[] into normalized Product[]
  getFavorites: async (): Promise<Product[]> => {
    const res = await apiClient.get<unknown>('/api/Favorites');
    const raw = res.data;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: unknown[] })?.data)
      ? (raw as { data: unknown[] }).data
      : Array.isArray((raw as { items?: unknown[] })?.items)
      ? (raw as { items: unknown[] }).items
      : [];
    return list.map(normalizeFavoriteToProduct);
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
