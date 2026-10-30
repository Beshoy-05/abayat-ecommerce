// ==========================================
// 👑 L'ÉLÉGANCE ABAYA ATELIER - API TYPES & BACKEND CONTRACTS
// ==========================================

export enum ProductSortOptions {
  NameAsc = 1,
  NameDesc = 2,
  PriceAsc = 3,
  PriceDesc = 4,
}

export enum ReviewSortOptions {
  DateAsc = 1,
  DateDesc = 2,
  RatingAsc = 3,
  RatingDesc = 4,
}

export type OrderStatus = 'Pending' | 'Approved' | 'Cancelled' | 'PaymentReceived' | 'Processing' | 'Shipped' | 'Delivered' | string;
export type PaymentMethod = 'CashOnDelivery' | 'Card' | 'VodafoneCash' | 'InstaPay' | string;
export type UserRole = 'user' | 'admin' | 'Admin' | string;

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
  discount?: number | null; // Discount percentage (0 - 100)
  finalPrice: number;        // The actual selling price
  categoryId: number;
  categoryName: string;
  pictureUrl?: string;
  images: string[];
  variants: ProductVariant[];
  colorGroups: ColorGroup[];
}

export type ProductColorGroup = ColorGroup;
export type ProductDto = Product;

export interface Category {
  id: number;
  name: string;
  productsCount?: number;
}

export interface CartItem {
  id: number;
  productId?: number;
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
  status:
    | 'Pending'
    | 'Approved'
    | 'PaymentReceived'
    | 'Processing'
    | 'Shipped'
    | 'Delivered'
    | 'Completed'
    | 'Cancelled'
    | 'Rejected'
    | 'Expired'
    | string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  subtotal?: number;
  totalAmount?: number;
  total?: number;
  comments?: string;
  cancellationReason?: string | null;
  customerId?: number;
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
  createdAt?: string;
  reviews: Review[] | PaginatedList<Review>;
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
  categoryId?: number | null;
  search?: string | null;
  color?: string | null;
  size?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sortingOption?: ProductSortOptions | number; // 1=NameAsc, 2=NameDesc, 3=PriceAsc, 4=PriceDesc
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
  discount?: number | null;
  categoryId: number;
  imageUrl?: string;
  imageUrls?: string[];
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

// ==========================================
// 🎯 BACKEND INTEGRATION CONTRACT ALIASES & TYPES
// ==========================================
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: string[];
}

export type ProductSizeStockResponseDto = SizeStock;
export type ProductColorGroupResponseDto = ColorGroup;
export type ProductVariantDto = ProductVariant;
export type CategoryDto = Category;
export type CartItemDto = CartItem;
export type CartDto = Cart;
export type OrderItemDto = OrderItem;
export type OrderDto = Order;
export type ReviewDto = Review;
export type ProductReviewsSummaryDto = ReviewsResponse;
export type DeliveryMethodDto = DeliveryMethod;
export type DashboardSummaryDto = DashboardSummaryResponse;
export type RevenueOverviewDto = RevenueOverview;
export type OrdersOverviewDto = OrdersOverview;
export type CustomersOverviewDto = CustomersOverview;
export type CatalogOverviewDto = CatalogOverview;
export type TopSellingProductDto = TopSellingProduct;
export type LowStockItemDto = LowStockItem;
export type RecentOrderDto = RecentOrder;
export type SalesChartPointDto = SalesChartPoint;
export type UserDTO = CustomerDto;

export type LoginCommand = { email: string; password: string };
export type RegisterCommand = { displayName: string; email: string; password: string; phoneNumber?: string | null };
export type UserDto = AuthResponse;
export type UserProfileDto = UserProfile;
export type UpdateProfileRequest = { displayName: string; phoneNumber?: string | null };
export type ChangePasswordRequest = { currentPassword: string; newPassword: string };
export type DeleteAccountRequest = { password: string };

export type GetAllProductsQueryParameters = ProductFilterParams;
export type ProductSizeStockDto = { size: string; stockQuantity: number };
export type ProductColorGroupDto = { color: string; sizes: ProductSizeStockDto[]; imageUrls?: string[] | null };
export type CreateProductCommand = CreateProductPayload;
export type UpdateProductCommand = UpdateProductPayload;

export type CreateCategoryCommand = { name: string };
export type UpdateCategoryCommand = { id: number; name: string };

export type AddItemToCartCommand = { productVariantId: number; quantity: number };

export interface FavoriteDto {
  productId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  categoryId: number;
  categoryName: string;
  pictureUrl?: string | null;
}

export type CreateOrderItemRequest = { productVariantId: number; quantity: number };
export type CreateOrderCommand = CreateOrderPayload;
export type CancelOrderRequest = { reason?: string | null };
export type OrderQueryParameters = { pageIndex?: number; pageSize?: number };

export type CreateReviewRequest = { productId: number; stars: number; message: string };
export type UpdateReviewRequest = { stars: number; message: string };
export type GetReviewesQueryParameter = { pageIndex?: number; pageSize?: number; sortingOption?: ReviewSortOptions };

export type CreateDeliveryMethodCommand = CreateDeliveryMethodPayload;
export type UpdateDeliveryMethodCommand = UpdateDeliveryMethodPayload;

export type GetAllCustomerQueryPatameter = { pageIndex?: number; pageSize?: number; search?: string | null };

export interface CloudinarySignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
}

export type UpdateSiteSettingsCommand = UpdateSiteSettingsPayload;

