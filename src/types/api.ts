// ==========================================
// 👑 L'ÉLÉGANCE ABAYA ATELIER - API TYPES
// ==========================================

export interface PaginatedList<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: T[];
}

export interface ProductVariant {
  id: number;
  productId: number;
  color: string;
  size: string;
  stockQuantity: number;
  images: string[];
}

export interface SizeStock {
  variantId: number;
  size: string;
  stockQuantity: number;
}

export interface ColorGroup {
  color: string;
  images: string[];
  sizes: SizeStock[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  pictureUrl: string;
  images: string[];
  variants: ProductVariant[];
  colorGroups: ColorGroup[];
}

export interface Category {
  id: number;
  name: string;
  productsCount?: number;
}

export interface CartItem {
  id: number;
  productVariantId: number;
  productName: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  pictureUrl?: string;
}

export interface Cart {
  id: number;
  customerId: number;
  items: CartItem[];
  totalAmount: number;
}

export interface DeliveryMethod {
  id: number;
  shortName: string;
  description: string;
  cost: number;
  deliveryTime: string;
}

export interface OrderItem {
  id: number;
  productVariantId: number;
  productName: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  pictureUrl?: string;
}

export interface Order {
  id: number;
  orderDate: string;
  shippingAddress: string;
  deliveryMethod?: string;
  deliveryCost?: number;
  deliveryMethodId?: number;
  paymentMethod: string;
  paymentReceiptUrl?: string | null;
  status: 'Pending' | 'PaymentReceived' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  subtotal?: number;
  totalAmount?: number;
  total?: number;
  comments?: string;
}

export interface CreateOrderPayload {
  shippingAddress: string;
  items: { productVariantId: number; quantity: number }[];
  deliveryMethodId?: number;
  paymentMethod?: string;
  paymentReceiptUrl?: string | null;
  comments?: string;
}

export interface Review {
  id: number;
  productId: number;
  customerName?: string;
  displayName?: string;
  stars: number;
  message: string;
  createdAt?: string;
  createdDate?: string;
}

export interface ReviewsResponse {
  productId: number;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export interface UserProfile {
  id?: string | number;
  displayName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  roles?: string[];
}

export interface AuthResponse {
  displayName: string;
  email: string;
  token: string;
}

export interface ProductFilterParams {
  pageIndex?: number;
  pageSize?: number;
  categoryId?: number;
  search?: string;
  color?: string;
  size?: string;
  sortingOption?: number; // 1=NameAsc, 2=NameDesc, 3=PriceAsc, 4=PriceDesc
}

export type CurrencyCode = 'EGP' | 'SAR' | 'AED' | 'USD' | 'KWD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  symbolAr: string;
  rateToSAR: number; // 1 unit in currency = X SAR
}

export interface ImageUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export interface CreateProductColor {
  color: string;
  sizes: { size: string; stockQuantity: number }[];
  imageUrls: string[];
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  imageUrl: string;
  imageUrls: string[];
  colors: CreateProductColor[];
}

export interface UpdateProductPayload extends CreateProductPayload {
  id: number;
}

export interface CreateDeliveryMethodPayload {
  shortName: string;
  description: string;
  deliveryTime: string;
  cost: number;
}

export interface UpdateDeliveryMethodPayload {
  id: number;
  shortName: string;
  description: string;
  deliveryTime: string;
  cost: number;
}

export interface CustomerDto {
  id: number | string;
  name: string;
  userName: string;
  email: string;
  phone: string;
  role?: string;
  roles: string[];
}

// ==========================================
// 📊 ADMIN DASHBOARD ANALYTICS TYPES
// ==========================================

export interface RevenueOverview {
  totalRevenue: number;       // All-time valid revenue (excluding Cancelled/Rejected)
  todayRevenue: number;       // Revenue generated today (UTC)
  thisMonthRevenue: number;   // Revenue generated during current month
}

export interface OrdersOverview {
  totalOrders: number;        // Total order count
  pendingOrders: number;      // Orders awaiting review/approval
  approvedOrders: number;     // Orders approved for processing
  cancelledOrders: number;    // Cancelled or rejected orders
  todayOrders: number;        // Orders placed today
}

export interface CustomersOverview {
  totalCustomers: number;     // Total registered users
  newCustomersToday: number;  // Users registered today
  newCustomersThisMonth: number;
}

export interface CatalogOverview {
  totalProducts: number;      // Active products count
  totalCategories: number;    // Categories count
  lowStockCount: number;      // Variants with stock <= 5 units
}

export interface TopSellingProduct {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  imageUrl: string | null;
}

export interface LowStockItem {
  productId: number;
  productName: string;
  variantId: number;
  color: string;
  size: string;
  quantity: number;
}

export interface RecentOrder {
  orderId: number;
  customerName: string;
  orderDate: string;          // ISO 8601 string
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Cancelled' | 'Rejected' | 'Expired' | string;
  itemsCount: number;
}

export interface SalesChartPoint {
  date: string;               // Format: "YYYY-MM-DD"
  revenue: number;            // Daily sales sum
  ordersCount: number;        // Daily orders count
}

export interface DashboardSummaryResponse {
  revenue: RevenueOverview;
  orders: OrdersOverview;
  customers: CustomersOverview;
  catalog: CatalogOverview;
  topSellingProducts: TopSellingProduct[];
  lowStockAlerts: LowStockItem[];
  recentOrders: RecentOrder[];
  dailySalesTrend: SalesChartPoint[];
}

// ==========================================
// ⚙️ SITE SETTINGS & CMS TYPES
// ==========================================

export interface SiteSettingDto {
  id: number;
  storeName: string;
  aboutUs: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  whatsappNumber: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  snapchatUrl: string | null;
  privacyPolicy: string | null;
  returnPolicy: string | null;
  shippingPolicy: string | null;
  announcementBarText: string | null;
  isAnnouncementBarActive: boolean;
  // Hero CMS Section
  heroBadge?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  heroCardTag?: string | null;
  heroCardTitle?: string | null;
  updatedAt: string;
}

export interface UpdateSiteSettingsPayload {
  storeName: string;                  // Required, max 150 chars
  aboutUs?: string | null;            // Max 4000 chars
  contactEmail?: string | null;       // Valid email format, max 150 chars
  contactPhone?: string | null;       // Max 50 chars
  address?: string | null;            // Max 300 chars
  whatsappNumber?: string | null;     // Max 50 chars
  facebookUrl?: string | null;        // URL string
  instagramUrl?: string | null;       // URL string
  twitterUrl?: string | null;         // URL string
  tiktokUrl?: string | null;          // URL string
  snapchatUrl?: string | null;        // URL string
  privacyPolicy?: string | null;      // Rich text or Markdown
  returnPolicy?: string | null;       // Rich text or Markdown
  shippingPolicy?: string | null;     // Rich text or Markdown
  announcementBarText?: string | null;// Max 500 chars
  isAnnouncementBarActive: boolean;   // Toggle announcement bar on/off
  // Hero CMS Section
  heroBadge?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  heroCardTag?: string | null;
  heroCardTitle?: string | null;
}



