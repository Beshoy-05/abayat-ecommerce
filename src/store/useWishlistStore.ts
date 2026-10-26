import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/api';
import { favoritesService } from '@/api/favorites';

interface WishlistState {
  wishlistIds: number[];
  wishlistProducts: Product[];
  isLoading: boolean;
  toggleFavorite: (product: Product, isAuthenticated: boolean) => Promise<boolean>;
  isFavorite: (productId: number) => boolean;
  fetchFavorites: () => Promise<void>;
  removeFromWishlist: (productId: number, isAuthenticated: boolean) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      wishlistProducts: [],
      isLoading: false,

      isFavorite: (productId: number) => {
        return get().wishlistIds.includes(productId);
      },

      fetchFavorites: async () => {
        try {
          set({ isLoading: true });
          const products = await favoritesService.getFavorites();
          const ids = products.map((p) => p.id);
          set({ wishlistProducts: products, wishlistIds: ids, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      toggleFavorite: async (product: Product, isAuthenticated: boolean) => {
        const currentIds = get().wishlistIds;
        const exists = currentIds.includes(product.id);

        if (isAuthenticated) {
          // Optimistic update
          const newIds = exists
            ? currentIds.filter((id) => id !== product.id)
            : [...currentIds, product.id];
          const newProducts = exists
            ? get().wishlistProducts.filter((p) => p.id !== product.id)
            : [...get().wishlistProducts, product];

          set({ wishlistIds: newIds, wishlistProducts: newProducts });

          try {
            // Backend returns boolean: true if added, false if removed (Rule #5)
            const result = await favoritesService.toggleFavorite(product.id);
            if (result && !exists) {
              set({
                wishlistIds: Array.from(new Set([...get().wishlistIds, product.id])),
              });
            } else if (!result && exists) {
              set({
                wishlistIds: get().wishlistIds.filter((id) => id !== product.id),
              });
            }
            return result;
          } catch {
            // Revert on network failure
            set({ wishlistIds: currentIds, wishlistProducts: get().wishlistProducts });
            return exists;
          }
        } else {
          // Guest mode
          if (exists) {
            set({
              wishlistIds: currentIds.filter((id) => id !== product.id),
              wishlistProducts: get().wishlistProducts.filter((p) => p.id !== product.id),
            });
            return false;
          } else {
            set({
              wishlistIds: [...currentIds, product.id],
              wishlistProducts: [...get().wishlistProducts, product],
            });
            return true;
          }
        }
      },

      removeFromWishlist: async (productId: number, isAuthenticated: boolean) => {
        set({
          wishlistIds: get().wishlistIds.filter((id) => id !== productId),
          wishlistProducts: get().wishlistProducts.filter((p) => p.id !== productId),
        });

        if (isAuthenticated) {
          try {
            await favoritesService.removeFavorite(productId);
          } catch {
            // ignore
          }
        }
      },
    }),
    {
      name: 'abaya_wishlist_store',
      partialize: (state) => ({
        wishlistIds: state.wishlistIds,
        wishlistProducts: state.wishlistProducts,
      }),
    }
  )
);
