import { sendGAEvent } from '@next/third-parties/google';

// ==========================================
// 📈 GOOGLE ANALYTICS 4 (GA4) & CONSENT UTILITIES
// ==========================================

export type ConsentStatus = 'granted' | 'denied' | 'undecided';

export const CONSENT_STORAGE_KEY = 'abaya_analytics_consent_v1';
const TRACKED_PURCHASES_STORAGE_KEY = 'abaya_tracked_purchases_v1';
export const GA_CURRENCY = (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'EGP').trim();
export const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim();

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface GA4EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  discount?: number;
  quantity?: number;
  index?: number;
}

// Forbidden PII keys — strictly stripped before any analytics dispatch
const FORBIDDEN_PII_KEYS = new Set([
  'email',
  'customerEmail',
  'customer_email',
  'email_hash',
  'phone',
  'phoneNumber',
  'customerPhone',
  'customer_phone',
  'phone_hash',
  'fullName',
  'customerName',
  'name',
  'address',
  'streetAddress',
  'shippingAddress',
  'enhanced_conversion_data',
]);

// In-memory pre-consent buffer (only held for the active page before consent choice; never persisted)
let pendingEventsQueue: Array<{ eventName: string; params: Record<string, unknown> }> = [];
let isGAReady = false;

// Deduplication trackers
const trackedPurchasesMemory = new Set<string>();
let lastViewItemSignature = '';
let lastViewItemTimestamp = 0;
let lastViewListSignature = '';
let lastViewListTimestamp = 0;

function roundCurrency(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Number(amount.toFixed(2));
}

function sanitizeEventParams(params: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (FORBIDDEN_PII_KEYS.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'number' && !Number.isFinite(value)) continue;
    clean[key] = value;
  }
  return clean;
}

function sanitizeItems(items: GA4EcommerceItem[]): Record<string, unknown>[] {
  return items.map((item) => {
    const cleanItem: Record<string, unknown> = {
      item_id: String(item.item_id),
      item_name: String(item.item_name),
      price: roundCurrency(item.price),
    };
    if (item.item_category) cleanItem.item_category = item.item_category;
    if (item.item_variant) cleanItem.item_variant = item.item_variant;
    if (item.discount !== undefined && item.discount > 0) {
      cleanItem.discount = roundCurrency(item.discount);
    }
    if (item.quantity !== undefined && item.quantity > 0) {
      cleanItem.quantity = item.quantity;
    }
    if (item.index !== undefined && item.index > 0) {
      cleanItem.index = item.index;
    }
    return cleanItem;
  });
}

function clearGaCookies(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  try {
    const cookies = document.cookie.split(';');
    const hostname = window.location.hostname;
    const domainParts = hostname.split('.');
    const rootDomain =
      domainParts.length >= 2 ? `.${domainParts.slice(-2).join('.')}` : hostname;

    for (const rawCookie of cookies) {
      const cookieName = rawCookie.split('=')[0]?.trim();
      if (cookieName && (cookieName === '_ga' || cookieName.startsWith('_ga_'))) {
        document.cookie = `${cookieName}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${cookieName}=; Max-Age=0; path=/; domain=${hostname}; SameSite=Lax`;
        document.cookie = `${cookieName}=; Max-Age=0; path=/; domain=${rootDomain}; SameSite=Lax`;
      }
    }
  } catch {
    // Ignore cookie clearing errors in restricted environments
  }
}

export function pushGtagConsent(mode: 'default' | 'update', granted: boolean): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  const consentPayload = {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  };

  if (typeof window.gtag === 'function') {
    window.gtag('consent', mode, consentPayload);
  } else {
    // Push native Arguments object expected by gtag.js
    const pushArgs = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    } as unknown as (...args: unknown[]) => void;
    pushArgs('consent', mode, consentPayload);
  }
}

export function getAnalyticsConsent(): ConsentStatus {
  if (typeof window === 'undefined') return 'undecided';
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === 'granted' || stored === 'denied') return stored;
    return 'undecided';
  } catch {
    return 'undecided';
  }
}

export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsent() === 'granted';
}

export function setAnalyticsConsent(status: 'granted' | 'denied', gaId = GA_MEASUREMENT_ID): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch {
    // Ignore storage quota errors
  }

  if (gaId) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = status !== 'granted';
  }

  if (status === 'denied') {
    isGAReady = false;
    pendingEventsQueue = [];
    pushGtagConsent('update', false);
    clearGaCookies();
  } else {
    pushGtagConsent('update', true);
  }

  window.dispatchEvent(new CustomEvent<ConsentStatus>('abaya:consent-updated', { detail: status }));
}

export function openConsentPreferences(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('abaya:open-consent-preferences'));
}

export function markGoogleAnalyticsReady(): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;

  window.dataLayer = window.dataLayer || [];
  isGAReady = true;

  if (pendingEventsQueue.length > 0) {
    const queued = [...pendingEventsQueue];
    pendingEventsQueue = [];
    for (const item of queued) {
      sendGAEvent('event', item.eventName, item.params);
    }
  }
}

export function clearPendingAnalyticsQueue(): void {
  pendingEventsQueue = [];
}

/**
 * Core consent-aware GA4 event dispatcher.
 * Sends nothing when consent is denied; queues up to 10 current-page events while undecided
 * so landing-page funnel events are preserved ONLY if the user explicitly opts in.
 */
export const trackEvent = (eventName: string, eventParams: Record<string, unknown> = {}): void => {
  if (typeof window === 'undefined') return;

  const consent = getAnalyticsConsent();
  if (consent === 'denied') return;

  const cleanParams = sanitizeEventParams(eventParams);

  if (process.env.NODE_ENV === 'development') {
    console.debug(`[GA4:${consent}] ${eventName}`, cleanParams);
  }

  if (consent === 'undecided') {
    if (pendingEventsQueue.length < 10) {
      pendingEventsQueue.push({ eventName, params: cleanParams });
    }
    return;
  }

  if (!isGAReady) {
    if (pendingEventsQueue.length < 10) {
      pendingEventsQueue.push({ eventName, params: cleanParams });
    }
    return;
  }

  window.dataLayer = window.dataLayer || [];
  sendGAEvent('event', eventName, cleanParams);
};

/**
 * Optional manual page_view helper.
 * Note: Automatic page_view tracking is already handled by `@next/third-parties/google`
 * (`gtag('config', gaId)` + GA4 Enhanced Measurement history listener). Do NOT invoke on
 * standard route changes to avoid duplicate `page_view` events.
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  trackEvent('page_view', {
    page_path: pagePath,
    ...(pageTitle ? { page_title: pageTitle } : {}),
  });
};

// ==========================================
// 🛍️ GA4 RECOMMENDED E-COMMERCE EVENTS
// ==========================================

export const trackViewItemList = (
  items: Array<{
    id: number;
    name: string;
    price: number;
    discount?: number;
    category?: string;
  }>,
  listMeta?: { listId?: string; listName?: string }
): void => {
  if (!items || items.length === 0) return;

  const listId = listMeta?.listId || 'catalog';
  const signature = `${listId}:${items.map((i) => i.id).join(',')}`;
  const now = Date.now();
  if (signature === lastViewListSignature && now - lastViewListTimestamp < 1500) {
    return;
  }
  lastViewListSignature = signature;
  lastViewListTimestamp = now;

  trackEvent('view_item_list', {
    currency: GA_CURRENCY,
    item_list_id: listMeta?.listId,
    item_list_name: listMeta?.listName || 'Product Collection',
    items: sanitizeItems(
      items.map((item, idx) => ({
        item_id: String(item.id),
        item_name: item.name,
        item_category: item.category || undefined,
        price: item.price,
        discount: item.discount,
        quantity: 1,
        index: idx + 1,
      }))
    ),
  });
};

export const trackSelectItem = (params: {
  id: number;
  name: string;
  price: number;
  category?: string;
  listId?: string;
  listName?: string;
  index?: number;
}): void => {
  trackEvent('select_item', {
    item_list_id: params.listId,
    item_list_name: params.listName,
    items: sanitizeItems([
      {
        item_id: String(params.id),
        item_name: params.name,
        item_category: params.category || undefined,
        price: params.price,
        quantity: 1,
        index: params.index,
      },
    ]),
  });
};

export const trackViewItem = (product: {
  id: number;
  name: string;
  price: number;
  finalPrice?: number;
  discount?: number | null;
  categoryName?: string;
}): void => {
  if (!product || !product.id) return;

  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const sellingPrice =
    product.finalPrice !== undefined && product.finalPrice !== null && product.finalPrice > 0
      ? product.finalPrice
      : hasDiscount
      ? roundCurrency(product.price * (1 - (product.discount || 0) / 100))
      : product.price;
  const discountAmount = Math.max(0, roundCurrency(product.price - sellingPrice));

  const signature = `${product.id}:${sellingPrice}`;
  const now = Date.now();
  if (signature === lastViewItemSignature && now - lastViewItemTimestamp < 1500) {
    return;
  }
  lastViewItemSignature = signature;
  lastViewItemTimestamp = now;

  trackEvent('view_item', {
    currency: GA_CURRENCY,
    value: roundCurrency(sellingPrice),
    items: sanitizeItems([
      {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.categoryName || undefined,
        price: sellingPrice,
        discount: discountAmount > 0 ? discountAmount : undefined,
        quantity: 1,
      },
    ]),
  });
};

export const trackAddToCart = (params: {
  variantId: number;
  productId?: number;
  name: string;
  category?: string;
  price: number;
  color?: string;
  size?: string;
  quantity: number;
}): void => {
  if (!params.quantity || params.quantity <= 0) return;
  const variantLabel = [params.color, params.size].filter(Boolean).join(' / ') || undefined;

  trackEvent('add_to_cart', {
    currency: GA_CURRENCY,
    value: roundCurrency(params.price * params.quantity),
    items: sanitizeItems([
      {
        item_id: String(params.productId || params.variantId),
        item_name: params.name,
        item_category: params.category || undefined,
        item_variant: variantLabel,
        price: params.price,
        quantity: params.quantity,
      },
    ]),
  });
};

export const trackRemoveFromCart = (params: {
  variantId: number;
  productId?: number;
  name: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
}): void => {
  if (!params.quantity || params.quantity <= 0) return;
  const variantLabel = [params.color, params.size].filter(Boolean).join(' / ') || undefined;

  trackEvent('remove_from_cart', {
    currency: GA_CURRENCY,
    value: roundCurrency(params.price * params.quantity),
    items: sanitizeItems([
      {
        item_id: String(params.productId || params.variantId),
        item_name: params.name,
        item_variant: variantLabel,
        price: params.price,
        quantity: params.quantity,
      },
    ]),
  });
};

export const trackViewCart = (params: {
  total: number;
  items: Array<{
    variantId: number;
    productId?: number;
    name: string;
    color?: string;
    size?: string;
    price: number;
    quantity: number;
  }>;
}): void => {
  if (!params.items || params.items.length === 0) return;

  trackEvent('view_cart', {
    currency: GA_CURRENCY,
    value: roundCurrency(params.total),
    items: sanitizeItems(
      params.items.map((it, idx) => ({
        item_id: String(it.productId || it.variantId),
        item_name: it.name,
        item_variant: [it.color, it.size].filter(Boolean).join(' / ') || undefined,
        price: it.price,
        quantity: it.quantity,
        index: idx + 1,
      }))
    ),
  });
};

export const trackBeginCheckout = (params: {
  total: number;
  itemsCount?: number;
  items: Array<{
    variantId: number;
    productId?: number;
    name: string;
    color?: string;
    size?: string;
    price: number;
    quantity: number;
  }>;
}): void => {
  if (!params.items || params.items.length === 0) return;

  trackEvent('begin_checkout', {
    currency: GA_CURRENCY,
    value: roundCurrency(params.total),
    items: sanitizeItems(
      params.items.map((it, idx) => ({
        item_id: String(it.productId || it.variantId),
        item_name: it.name,
        item_variant: [it.color, it.size].filter(Boolean).join(' / ') || undefined,
        price: it.price,
        quantity: it.quantity,
        index: idx + 1,
      }))
    ),
  });
};

function hasTrackedPurchaseBefore(transactionId: string): boolean {
  if (trackedPurchasesMemory.has(transactionId)) return true;
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(TRACKED_PURCHASES_STORAGE_KEY);
    if (!raw) return false;
    const list: string[] = JSON.parse(raw);
    return Array.isArray(list) && list.includes(transactionId);
  } catch {
    return false;
  }
}

function recordTrackedPurchase(transactionId: string): void {
  trackedPurchasesMemory.add(transactionId);
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(TRACKED_PURCHASES_STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = Array.from(new Set([...(Array.isArray(list) ? list : []), transactionId])).slice(-50);
    localStorage.setItem(TRACKED_PURCHASES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
}

export const trackPurchase = (params: {
  orderId: number | string;
  total: number;
  shipping?: number;
  paymentMethod?: string;
  items: Array<{
    variantId: number;
    productId?: number;
    name: string;
    color?: string;
    size?: string;
    price: number;
    quantity: number;
  }>;
}): void => {
  const transactionId = String(params.orderId ?? '').trim();
  if (!transactionId || transactionId === '0' || !params.items || params.items.length === 0) {
    return;
  }

  // Prevent duplicate purchase tracking across re-renders and page reloads
  if (hasTrackedPurchaseBefore(transactionId)) {
    return;
  }
  recordTrackedPurchase(transactionId);

  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: GA_CURRENCY,
    value: roundCurrency(params.total),
    shipping: params.shipping !== undefined ? roundCurrency(params.shipping) : 0,
    ...(params.paymentMethod ? { payment_type: params.paymentMethod } : {}),
    items: sanitizeItems(
      params.items.map((it, idx) => ({
        item_id: String(it.productId || it.variantId),
        item_name: it.name,
        item_variant: [it.color, it.size].filter(Boolean).join(' / ') || undefined,
        price: it.price,
        quantity: it.quantity,
        index: idx + 1,
      }))
    ),
  });
};
