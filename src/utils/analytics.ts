// ==========================================
// 📈 GOOGLE TAG MANAGER & GA4 / ADS TRACKING
// ==========================================

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const trackEvent = (eventName: string, eventParams: Record<string, unknown> = {}) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...eventParams,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Event] ${eventName}:`, eventParams);
    }
  }
};

// Simple secure hash helper (SHA-256 for enhanced conversions)
export const hashData = async (value: string): Promise<string> => {
  if (!value || typeof window === 'undefined' || !window.crypto?.subtle) {
    return '';
  }
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(value.trim().toLowerCase());
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return '';
  }
};

// Standard E-Commerce Funnel Helpers
export const trackViewItemList = (items: Array<{ id: number; name: string; price: number; category?: string }>) => {
  trackEvent('view_item_list', {
    items: items.map((item, idx) => ({
      item_id: item.id.toString(),
      item_name: item.name,
      price: item.price,
      item_category: item.category || 'Luxury Abaya',
      index: idx + 1,
    })),
  });
};

export const trackViewItem = (product: { id: number; name: string; price: number; categoryName?: string; variants?: unknown[] }) => {
  trackEvent('view_item', {
    currency: 'SAR',
    value: product.price,
    items: [
      {
        item_id: product.id.toString(),
        item_name: product.name,
        price: product.price,
        item_category: product.categoryName || 'Luxury Abaya',
      },
    ],
  });
};

export const trackAddToCart = (params: {
  variantId: number;
  productId: number;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
}) => {
  trackEvent('add_to_cart', {
    currency: 'SAR',
    value: params.price * params.quantity,
    items: [
      {
        item_id: params.variantId.toString(),
        product_id: params.productId.toString(),
        item_name: params.name,
        price: params.price,
        quantity: params.quantity,
        item_variant: `${params.color} / ${params.size}`,
      },
    ],
  });
};

export const trackRemoveFromCart = (params: {
  variantId: number;
  name: string;
  price: number;
  quantity: number;
}) => {
  trackEvent('remove_from_cart', {
    currency: 'SAR',
    value: params.price * params.quantity,
    items: [
      {
        item_id: params.variantId.toString(),
        item_name: params.name,
        price: params.price,
        quantity: params.quantity,
      },
    ],
  });
};

export const trackBeginCheckout = (params: {
  total: number;
  itemsCount: number;
  items: Array<{ variantId: number; name: string; price: number; quantity: number }>;
}) => {
  trackEvent('begin_checkout', {
    currency: 'SAR',
    value: params.total,
    items: params.items.map((it) => ({
      item_id: it.variantId.toString(),
      item_name: it.name,
      price: it.price,
      quantity: it.quantity,
    })),
  });
};

export const trackPurchase = async (params: {
  orderId: number;
  total: number;
  shipping: number;
  customerEmail?: string;
  customerPhone?: string;
  items: Array<{ variantId: number; name: string; price: number; quantity: number }>;
}) => {
  const hashedEmail = params.customerEmail ? await hashData(params.customerEmail) : undefined;
  const hashedPhone = params.customerPhone ? await hashData(params.customerPhone) : undefined;

  trackEvent('purchase', {
    transaction_id: params.orderId.toString(),
    value: params.total,
    currency: 'SAR',
    shipping: params.shipping,
    enhanced_conversion_data: {
      email_hash: hashedEmail,
      phone_hash: hashedPhone,
    },
    items: params.items.map((it) => ({
      item_id: it.variantId.toString(),
      item_name: it.name,
      price: it.price,
      quantity: it.quantity,
    })),
  });
};
