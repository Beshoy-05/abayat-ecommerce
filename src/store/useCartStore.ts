import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, ProductVariant, Product } from '@/types/api';
import { cartService } from '@/api/cart';
import { productsService } from '@/api/products';
import { trackAddToCart, trackRemoveFromCart } from '@/utils/analytics';

const VARIANT_META_CACHE_KEY = 'abaya_cart_variant_meta';

interface VariantMeta {
  productId?: number;
  productName: string;
  color: string;
  size: string;
  unitPrice: number;
  pictureUrl: string;
}

const getVariantMetaMap = (): Record<number, VariantMeta> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(VARIANT_META_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveVariantMeta = (variantId: number, meta: VariantMeta) => {
  if (typeof window === 'undefined') return;
  try {
    const map = getVariantMetaMap();
    map[variantId] = meta;
    localStorage.setItem(VARIANT_META_CACHE_KEY, JSON.stringify(map));
  } catch {}
};

const enrichCartItems = async (items: CartItem[]): Promise<CartItem[]> => {
  if (!items || items.length === 0) return [];
  const map = getVariantMetaMap();

  const missingMeta = items.some(
    (it) => !it.productName || it.unitPrice === 0 || !it.pictureUrl || !map[it.productVariantId]
  );

  if (missingMeta) {
    try {
      const res = await productsService.getProducts({ pageSize: 50 });
      if (res && res.data) {
        res.data.forEach((p) => {
          p.variants?.forEach((v) => {
            map[v.id] = {
              productId: p.id,
              productName: p.name,
              color: v.color,
              size: v.size,
              unitPrice: p.price,
              pictureUrl: v.images?.[0] || p.pictureUrl || '',
            };
          });
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(VARIANT_META_CACHE_KEY, JSON.stringify(map));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Could not populate variant metadata from products catalog:', e);
    }
  }

  return items.map((item) => {
    const meta = map[item.productVariantId];
    const productName = item.productName?.trim() || meta?.productName || 'عباية فاخرة';
    const color = item.color?.trim() || meta?.color || '';
    const size = item.size?.trim() || meta?.size || '';
    const unitPrice = item.unitPrice > 0 ? item.unitPrice : meta?.unitPrice || 0;
    const quantity = item.quantity || 1;
    const totalPrice = item.totalPrice > 0 ? item.totalPrice : unitPrice * quantity;
    const pictureUrl =
      item.pictureUrl ||
      meta?.pictureUrl ||
      'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg';

    return {
      ...item,
      productName,
      color,
      size,
      unitPrice,
      quantity,
      totalPrice,
      pictureUrl,
    };
  });
};

interface CartState {
  cart: Cart | null;
  guestItems: CartItem[];
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (params: {
    product: Product;
    variant: ProductVariant;
    quantity: number;
    isAuthenticated: boolean;
  }) => Promise<{ success: boolean; message: string }>;
  removeItem: (cartItemId: number, isAuthenticated: boolean) => Promise<void>;
  clearCart: () => void;
  getItemsCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      guestItems: [],
      isCartOpen: false,
      isLoading: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      fetchCart: async () => {
        try {
          set({ isLoading: true });
          const liveCart = await cartService.getCart();
          if (liveCart && Array.isArray(liveCart.items)) {
            const enriched = await enrichCartItems(liveCart.items);
            const computedTotal = enriched.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
            set({
              cart: {
                ...liveCart,
                items: enriched,
                totalAmount: liveCart.totalAmount > 0 ? liveCart.totalAmount : computedTotal,
              },
              isLoading: false,
            });
          } else {
            set({ cart: liveCart, isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      addItem: async ({ product, variant, quantity, isAuthenticated }) => {
        // Cache metadata for this variant immediately
        saveVariantMeta(variant.id, {
          productId: product.id,
          productName: product.name,
          color: variant.color,
          size: variant.size,
          unitPrice: product.price,
          pictureUrl: variant.images?.[0] || product.pictureUrl || '',
        });

        // Stock Guard check (Rule #9)
        const currentGuestItem = get().guestItems.find(
          (i) => i.productVariantId === variant.id
        );
        const currentQty = currentGuestItem ? currentGuestItem.quantity : 0;
        if (currentQty + quantity > variant.stockQuantity) {
          return {
            success: false,
            message: `Only ${variant.stockQuantity} pieces available for this size and color.`,
          };
        }

        if (isAuthenticated) {
          try {
            set({ isLoading: true });
            // Strict Rule #2 & #4: sends ONLY productVariantId & quantity
            const res = await cartService.addToCart({
              productVariantId: variant.id,
              quantity,
            });
            await get().fetchCart();
            trackAddToCart({
              variantId: variant.id,
              productId: product.id,
              name: product.name,
              price: product.price,
              color: variant.color,
              size: variant.size,
              quantity,
            });
            set({ isCartOpen: true });
            return { success: true, message: res.message || 'Item added to bag' };
          } catch (err: unknown) {
            set({ isLoading: false });
            return {
              success: false,
              message: err instanceof Error ? err.message : 'Failed to add item to bag',
            };
          }
        } else {
          // Guest mode cart state
          const existingIndex = get().guestItems.findIndex(
            (it) => it.productVariantId === variant.id
          );
          let newGuestItems = [...get().guestItems];
          if (existingIndex > -1) {
            const existing = newGuestItems[existingIndex];
            const updatedQty = Math.min(existing.quantity + quantity, variant.stockQuantity);
            newGuestItems[existingIndex] = {
              ...existing,
              quantity: updatedQty,
              totalPrice: updatedQty * product.price,
            };
          } else {
            const newItem: CartItem = {
              id: Date.now(),
              productVariantId: variant.id,
              productName: product.name,
              color: variant.color,
              size: variant.size,
              unitPrice: product.price,
              quantity,
              totalPrice: product.price * quantity,
              pictureUrl: variant.images?.[0] || product.pictureUrl,
            };
            newGuestItems.push(newItem);
          }

          trackAddToCart({
            variantId: variant.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            color: variant.color,
            size: variant.size,
            quantity,
          });

          set({ guestItems: newGuestItems, isCartOpen: true });
          return { success: true, message: 'Added to your bespoke bag' };
        }
      },

      removeItem: async (cartItemId: number, isAuthenticated: boolean) => {
        if (isAuthenticated) {
          try {
            await cartService.removeCartItem(cartItemId);
            await get().fetchCart();
          } catch {
            // fallback
          }
        } else {
          const removed = get().guestItems.find((i) => i.id === cartItemId);
          if (removed) {
            trackRemoveFromCart({
              variantId: removed.productVariantId,
              name: removed.productName,
              price: removed.unitPrice,
              quantity: removed.quantity,
            });
          }
          set({
            guestItems: get().guestItems.filter((it) => it.id !== cartItemId),
          });
        }
      },

      clearCart: () => {
        set({ cart: null, guestItems: [] });
      },

      getItemsCount: () => {
        const { cart, guestItems } = get();
        if (cart?.items && cart.items.length > 0) {
          return cart.items.reduce((sum, item) => sum + item.quantity, 0);
        }
        return guestItems.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        const { cart, guestItems } = get();
        if (cart?.items && cart.items.length > 0) {
          const itemsSum = cart.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
          if (itemsSum > 0) return itemsSum;
          if (cart.totalAmount > 0) return cart.totalAmount;
        }
        return guestItems.reduce((sum, item) => sum + item.totalPrice, 0);
      },
    }),
    {
      name: 'abaya_cart_store',
      partialize: (state) => ({ guestItems: state.guestItems }),
    }
  )
);
