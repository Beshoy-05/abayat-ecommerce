'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Package,
  Layers,
  Truck,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  UploadCloud,
  Check,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Clock,
  BarChart3,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { ordersService } from '@/api/orders';
import { productsService } from '@/api/products';
import { categoriesService } from '@/api/categories';
import { deliveryService } from '@/api/delivery';
import { customersService } from '@/api/customers';
import { imagesService } from '@/api/images';
import { Order, Product, Category, DeliveryMethod, CustomerDto } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import ShimmerBadge from '@/components/ui/ShimmerBadge';
import AdminDashboardOverview from '@/components/admin/AdminDashboardOverview';
import AdminSiteSettings from '@/components/admin/AdminSiteSettings';
import AdminProductStudio from '@/components/admin/AdminProductStudio';

export const normalizeCustomer = (c: any): CustomerDto => {
  const rolesList: string[] = [];
  const rawRoles = [
    ...(Array.isArray(c?.roles) ? c.roles : []),
    ...(Array.isArray(c?.Roles) ? c.Roles : []),
    ...(Array.isArray(c?.userRoles) ? c.userRoles : []),
    ...(c?.role ? [c.role] : []),
    ...(c?.Role ? [c.Role] : []),
  ];

  for (const item of rawRoles) {
    if (typeof item === 'string') {
      rolesList.push(item);
    } else if (typeof item === 'object' && item !== null) {
      const name = item.name || item.roleName || item.role || item.Role || item.normalizedName;
      if (typeof name === 'string') rolesList.push(name);
    }
  }

  const uniqueRoles = Array.from(new Set(rolesList));

  return {
    id: c.id ?? c.Id ?? c.userId,
    name: c.name ?? c.Name ?? c.displayName ?? c.userName ?? '',
    userName: c.userName ?? c.UserName ?? '',
    email: c.email ?? c.Email ?? '',
    phone: c.phone ?? c.Phone ?? c.phoneNumber ?? '',
    role: uniqueRoles[0] || c.role || c.Role || 'User',
    roles: uniqueRoles,
  };
};

export const isCustomerAdmin = (c: CustomerDto | any): boolean => {
  if (!c) return false;
  const list = [
    ...(Array.isArray(c.roles) ? c.roles : []),
    ...(Array.isArray(c.Roles) ? c.Roles : []),
    ...(c.role ? [c.role] : []),
    ...(c.Role ? [c.Role] : []),
  ];

  return list.some((r: any) => {
    if (typeof r === 'string') {
      const lower = r.trim().toLowerCase();
      return lower === 'admin' || lower === 'administrator' || lower.includes('admin');
    }
    if (typeof r === 'object' && r !== null) {
      const name = r.name || r.roleName || r.role || r.Role;
      if (typeof name === 'string' && name.toLowerCase().includes('admin')) return true;
    }
    return false;
  });
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuthStore();
  const { language, formatPrice } = useThemeStore();

  // Active Tab: overview | orders | products | categories | delivery | customers | settings
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'categories' | 'delivery' | 'customers' | 'settings'
  >('overview');

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. ORDERS STATE
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Cancelled'>('ALL');
  const [activeReceiptModalUrl, setActiveReceiptModalUrl] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // 2. PRODUCTS STATE
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 3. CATEGORIES STATE
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 4. DELIVERY STATE
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [newDeliveryName, setNewDeliveryName] = useState('');
  const [newDeliveryDesc, setNewDeliveryDesc] = useState('');
  const [newDeliveryTime, setNewDeliveryTime] = useState('');
  const [newDeliveryCost, setNewDeliveryCost] = useState('');

  // Editing Delivery Method State
  const [editingDelivery, setEditingDelivery] = useState<DeliveryMethod | null>(null);
  const [editDeliveryName, setEditDeliveryName] = useState('');
  const [editDeliveryDesc, setEditDeliveryDesc] = useState('');
  const [editDeliveryTime, setEditDeliveryTime] = useState('');
  const [editDeliveryCost, setEditDeliveryCost] = useState('');
  const [isEditDeliveryModalOpen, setIsEditDeliveryModalOpen] = useState(false);

  // 5. CUSTOMERS STATE
  const [customers, setCustomers] = useState<CustomerDto[]>([]);

  // Show temporary toast message
  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // FETCH DATA ACCORDING TO ACTIVE TAB
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersService.getAllOrders(1, 50);
      setOrders(res.data || []);
    } catch (err: any) {
      console.error('Error fetching admin orders:', err);
      showToast('error', 'تعذر تحميل قائمة الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productsService.getProducts({ pageSize: 50 });
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'تعذر تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesService.getCategories();
      setCategories(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDelivery = async () => {
    try {
      setLoading(true);
      const res = await deliveryService.getDeliveryMethods();
      setDeliveryMethods(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await customersService.getCustomers(1, 50);
      const rawList = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        : Array.isArray((res as any)?.items)
        ? (res as any).items
        : [];
      setCustomers(rawList.map(normalizeCustomer));
    } catch (err) {
      console.error(err);
      showToast('error', 'تعذر تحميل بيانات العملاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'delivery') loadDelivery();
    if (activeTab === 'customers') loadCustomers();
  }, [activeTab]);

  // ---------------- ORDER ACTIONS ----------------
  // Approve Order -> Deducts Inventory on Backend
  const handleApproveOrder = async (orderId: number) => {
    try {
      setLoading(true);
      await ordersService.approveOrder(orderId);
      showToast('success', `تم اعتماد الطلب #${orderId} وخصم الكميات من المخزون بنجاح!`);
      await loadOrders();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'تعذر اعتماد الطلب');
    } finally {
      setLoading(false);
    }
  };

  // Cancel Order -> Returns Inventory on Backend
  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    try {
      setLoading(true);
      await ordersService.cancelOrder(cancelModalOrder.id, cancelReason || 'إلغاء بواسطة الإدارة');
      showToast('success', `تم إلغاء الطلب #${cancelModalOrder.id} وإرجاع القطع للمخزون!`);
      setCancelModalOrder(null);
      setCancelReason('');
      await loadOrders();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'تعذر إلغاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PRODUCT ACTIONS ----------------
  const handleDeleteProduct = async (id: number) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج #${id} نهائياً؟`)) return;
    try {
      setLoading(true);

      // Clean up Cloudinary images associated with this product
      const targetProduct = products.find((p) => p.id === id);
      if (targetProduct) {
        const productImages = [
          targetProduct.pictureUrl,
          ...(targetProduct.images || []),
          ...(targetProduct.variants?.flatMap((v) => v.images || []) || []),
          ...(targetProduct.colorGroups?.flatMap((cg) => cg.images || []) || []),
        ].filter(Boolean) as string[];

        const uniqueImages = Array.from(new Set(productImages));
        uniqueImages.forEach((imgUrl) => {
          imagesService.deleteImage(imgUrl).catch(console.error);
        });
      }

      await productsService.deleteProduct(id);
      showToast('success', `تم حذف المنتج #${id} بنجاح`);
      await loadProducts();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'تعذر حذف المنتج');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CATEGORY ACTIONS ----------------
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setLoading(true);
      await categoriesService.createCategory(newCategoryName.trim());
      showToast('success', 'تم إنشاء القسم الجديد بنجاح!');
      setNewCategoryName('');
      await loadCategories();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'تعذر إنشاء القسم');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELIVERY ACTIONS ----------------
  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeliveryName.trim() || !newDeliveryCost) return;
    try {
      setLoading(true);
      await deliveryService.createDeliveryMethod({
        shortName: newDeliveryName.trim(),
        description: newDeliveryDesc.trim(),
        deliveryTime: newDeliveryTime.trim() || '1-2 أيام عمل',
        cost: parseFloat(newDeliveryCost) || 0,
      });
      showToast('success', 'تمت إضافة طريقة الشحن بنجاح!');
      setNewDeliveryName('');
      setNewDeliveryDesc('');
      setNewDeliveryTime('');
      setNewDeliveryCost('');
      await loadDelivery();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'تعذر إضافة طريقة الشحن');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDelivery = (dm: DeliveryMethod) => {
    setEditingDelivery(dm);
    setEditDeliveryName(dm.shortName || '');
    setEditDeliveryDesc(dm.description || '');
    setEditDeliveryTime(dm.deliveryTime || '');
    setEditDeliveryCost(dm.cost !== undefined ? String(dm.cost) : '0');
    setIsEditDeliveryModalOpen(true);
  };

  const handleUpdateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDelivery || !editDeliveryName.trim() || editDeliveryCost === '') return;

    try {
      setLoading(true);
      await deliveryService.updateDeliveryMethod(editingDelivery.id, {
        shortName: editDeliveryName.trim(),
        description: editDeliveryDesc.trim(),
        deliveryTime: editDeliveryTime.trim() || '1-2 أيام عمل',
        cost: parseFloat(editDeliveryCost) || 0,
      });
      showToast('success', 'تم تعديل طريقة الشحن بنجاح!');
      setIsEditDeliveryModalOpen(false);
      setEditingDelivery(null);
      await loadDelivery();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'تعذر تعديل طريقة الشحن');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDelivery = async (id: number, name: string) => {
    if (!confirm(`هل أنتِ متأكدة من حذف طريقة الشحن "${name}"؟`)) return;
    try {
      setLoading(true);
      await deliveryService.deleteDeliveryMethod(id);
      showToast('success', `تم حذف طريقة الشحن "${name}" بنجاح!`);
      await loadDelivery();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'تعذر حذف طريقة الشحن');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ROLE ACTIONS ----------------
  const handleToggleAdminRole = async (customer: CustomerDto) => {
    const currentlyAdmin = isCustomerAdmin(customer);
    try {
      setLoading(true);
      if (currentlyAdmin) {
        await customersService.removeRole(customer.id, 'Admin');
        showToast('success', `تم إلغاء صلاحية الأدمن عن ${customer.name}`);
        setCustomers((prev) =>
          prev.map((item) =>
            item.id === customer.id
              ? {
                  ...item,
                  roles: item.roles.filter((r) => !r.toLowerCase().includes('admin')),
                  role: 'User',
                }
              : item
          )
        );
      } else {
        await customersService.assignRole(customer.id, 'Admin');
        showToast('success', `تمت ترقية ${customer.name} إلى مدير نظام (Admin)!`);
        setCustomers((prev) =>
          prev.map((item) =>
            item.id === customer.id
              ? {
                  ...item,
                  roles: Array.from(new Set([...item.roles, 'Admin'])),
                  role: 'Admin',
                }
              : item
          )
        );
      }
      await loadCustomers();
    } catch (err: any) {
      console.error('Role toggle error:', err);
      showToast('error', err.response?.data?.message || 'تعذر تحديث الصلاحية');
    } finally {
      setLoading(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-serif text-2xl text-[var(--text-primary)]">
            غير مصرح بالدخول
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            هذه المنطقة مخصصة لإدارة دار الأزياء فقط. يتطلب الدخول صلاحيات مدير النظام (Admin).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors"
          >
            العودة للرئيسية
          </Link>
          <Link
            href="/login?redirect=/admin"
            className="px-6 py-2.5 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs shadow-md hover:brightness-105 transition-all"
          >
            تسجيل دخول كمدير
          </Link>
        </div>
      </div>
    );
  }

  const navTabs = [
    {
      id: 'overview' as const,
      label: 'المؤشرات والتحليلات',
      subtitle: 'KPIs & Sales Trend',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'orders' as const,
      label: 'الطلبات والإيصالات',
      subtitle: 'Review & Approvals',
      icon: <Package className="w-4 h-4" />,
      count: orders.length,
      alertCount: orders.filter((o) => o.status === 'Pending').length,
    },
    {
      id: 'products' as const,
      label: 'المنتجات والمخزون',
      subtitle: 'Catalog & Inventory',
      icon: <Layers className="w-4 h-4" />,
      count: products.length,
    },
    {
      id: 'categories' as const,
      label: 'أقسام الكتالوج',
      subtitle: 'Collections',
      icon: <Filter className="w-4 h-4" />,
      count: categories.length,
    },
    {
      id: 'delivery' as const,
      label: 'طرق الشحن والأسعار',
      subtitle: 'Couriers & Dispatch',
      icon: <Truck className="w-4 h-4" />,
      count: deliveryMethods.length,
    },
    {
      id: 'customers' as const,
      label: 'العملاء والصلاحيات',
      subtitle: 'Clientele & Roles',
      icon: <Users className="w-4 h-4" />,
      count: customers.length,
    },
    {
      id: 'settings' as const,
      label: 'إعدادات المتجر والسياسات',
      subtitle: 'Store CMS & Policies',
      icon: <Sliders className="w-4 h-4" />,
      badge: 'CMS',
    },
  ];

  const currentTab = navTabs.find((t) => t.id === activeTab) || navTabs[0];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500 text-black'
              : 'bg-rose-500 text-white'
          }`}
        >
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <ShimmerBadge icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              لوحة التحكم الملكية (Admin Portal)
            </ShimmerBadge>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              مباشر من السيرفر
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)] mt-2">
            إدارة الدار والطلبات والمخزون
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            مراجعة سكرينات إيصالات الدفع، اعتماد الطلبات وخصم المخزون، أو إلغائها وإرجاع الكميات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === 'orders') loadOrders();
              if (activeTab === 'products') loadProducts();
              if (activeTab === 'categories') loadCategories();
              if (activeTab === 'delivery') loadDelivery();
              if (activeTab === 'customers') loadCustomers();
            }}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-xs text-[var(--text-primary)] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--accent-gold)]' : ''}`} />
            <span>تحديث البيانات</span>
          </button>

          <Link
            href="/shop"
            className="px-4 py-2 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-md"
          >
            زيارة المتجر
          </Link>
        </div>
      </div>

      {/* Two-Column Responsive Layout (Main Content on Right, Vertical Navigation on Left) */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* ============================================================== */}
        {/* MAIN CONTENT AREA (Takes full remaining space, on the right in RTL) */}
        {/* ============================================================== */}
        <main className="flex-1 min-w-0 w-full order-2 lg:order-1 space-y-6">
          {/* 0. OVERVIEW & ANALYTICS TAB */}
          {activeTab === 'overview' && (
            <AdminDashboardOverview
              onNavigateTab={setActiveTab}
              showToast={showToast}
            />
          )}

      {/* ============================================================== */}
      {/* 6. SETTINGS & CMS TAB                                          */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <AdminSiteSettings showToast={showToast} />
      )}

      {/* ============================================================== */}
      {/* 1. ORDERS TAB (REVIEW RECEIPT SCREENSHOTS & APPROVE/CANCEL) */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Filter Chips */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {[
                { id: 'ALL', label: 'جميع الطلبات' },
                { id: 'Pending', label: 'قيد المراجعة (Pending)' },
                { id: 'Approved', label: 'معتمدة (Approved)' },
                { id: 'Cancelled', label: 'ملغية (Cancelled)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    orderFilter === f.id
                      ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/50 font-bold'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-subtle)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              إجمالي المعروض: <span className="font-bold text-[var(--text-primary)]">{filteredOrders.length}</span> طلب
            </p>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
              <Package className="w-10 h-10 mx-auto text-[var(--text-secondary)]/40" />
              <h3 className="font-serif text-lg text-[var(--text-primary)]">لا توجد طلبات في هذا القسم حالياً</h3>
              <p className="text-xs text-[var(--text-secondary)]">ستظهر هنا أي طلبات يقوم العملاء بإجرائها عبر المتجر فوراً.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isPending = order.status === 'Pending';
                const isApproved = order.status === 'Approved' || order.status === 'PaymentReceived';
                const isCancelled = order.status === 'Cancelled';

                return (
                  <div
                    key={order.id}
                    className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover:border-[var(--accent-gold)]/40 transition-all space-y-4"
                  >
                    {/* Top Row: ID, Date, Status, Payment Method */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-lg font-bold text-[var(--accent-gold)] tracking-wider">
                          #{order.id}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {new Date(order.orderDate).toLocaleString('ar-EG')}
                        </span>
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Payment Method Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-secondary)]">طريقة الدفع:</span>
                        <span className="text-xs font-bold text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 px-2 py-0.5 rounded border border-[var(--accent-gold)]/20">
                          {order.paymentMethod === 'InstaPay'
                            ? 'إنستاباي (InstaPay)'
                            : order.paymentMethod === 'VodafoneCash'
                            ? 'فودافون كاش'
                            : 'عند الاستلام'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Client info, Delivery info, Total, Receipt Thumbnail */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Client & Address Info */}
                      <div className="md:col-span-4 space-y-1 text-xs">
                        <p className="text-[var(--text-secondary)]">
                          العنوان وبيانات الاتصال:{' '}
                          <span className="font-medium text-[var(--text-primary)] block mt-0.5 leading-relaxed">
                            {order.shippingAddress}
                          </span>
                        </p>
                        {order.deliveryMethod && (
                          <p className="text-[11px] text-[var(--text-secondary)] pt-1">
                            شركة الشحن: <span className="font-semibold text-[var(--text-primary)]">{order.deliveryMethod}</span>
                          </p>
                        )}
                        {order.comments && (
                          <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg mt-1">
                            ملاحظة العميل: {order.comments}
                          </p>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="md:col-span-4 space-y-1 text-xs">
                        <p className="font-semibold text-[var(--text-secondary)] text-[11px]">القطع المطلوبة:</p>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                          {(order.items || order.orderItems || []).map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px] bg-[var(--bg-secondary)] p-1.5 rounded-lg">
                              <span className="font-serif font-medium text-[var(--text-primary)] truncate max-w-[150px]">
                                {it.productName} ({it.color} - {it.size})
                              </span>
                              <span className="font-bold text-[var(--accent-gold)] shrink-0">
                                × {it.quantity} ({formatPrice(it.unitPrice)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total & Receipt Screenshot */}
                      <div className="md:col-span-4 flex flex-col sm:flex-row items-center justify-between md:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-[10px] uppercase text-[var(--text-secondary)]">الإجمالي النهائي</p>
                          <p className="font-serif text-xl font-bold text-[var(--accent-gold)]">
                            {formatPrice(order.totalAmount || order.total || order.subtotal || 0)}
                          </p>
                        </div>

                        {/* RECEIPT SCREENSHOT BUTTON */}
                        {order.paymentReceiptUrl ? (
                          <button
                            type="button"
                            onClick={() => setActiveReceiptModalUrl(order.paymentReceiptUrl || null)}
                            className="p-2 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/40 hover:bg-[var(--accent-gold)]/25 text-[var(--accent-gold)] text-xs font-semibold flex items-center gap-2 transition-all shadow-sm group"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 border border-[var(--accent-gold)]/30">
                              <img
                                src={order.paymentReceiptUrl}
                                alt="Receipt Thumbnail"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <span className="text-[11px]">فحص السكرين شوت 🔍</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg">
                            بدون إيصال (دفع عند الاستلام)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions Row: Approve & Cancel */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {isPending && '⚠️ هذا الطلب قيد المراجعة. تأكد من صحة إيصال التحويل قبل الاعتماد.'}
                        {isApproved && '✓ تم اعتماد هذا الطلب وخصم القطع من المخزون بنجاح.'}
                        {isCancelled && '✕ تم إلغاء هذا الطلب وإرجاع القطع للمخزون.'}
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveOrder(order.id)}
                              className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>موافقة وخصم من المخزون</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalOrder(order);
                                setCancelReason('');
                              }}
                              className="px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>إلغاء وإرجاع للمخزون</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelModalOrder(order);
                              setCancelReason('');
                            }}
                            className="px-3 py-1.5 rounded-full border border-rose-500/30 text-rose-400 text-xs hover:bg-rose-500/10 transition-colors"
                          >
                            إلغاء الطلب المعتمد وإرجاع الكميات
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PRODUCTS TAB (ADD, EDIT, DELETE & STOCK MANAGEMENT) */}
      {/* ============================================================== */}
      {activeTab === 'products' && (
        (isCreatingProduct || editingProduct) ? (
          <AdminProductStudio
            categories={categories}
            initialProduct={editingProduct}
            onCancel={() => {
              setIsCreatingProduct(false);
              setEditingProduct(null);
            }}
            onSuccess={() => {
              setIsCreatingProduct(false);
              setEditingProduct(null);
              loadProducts();
            }}
            showToast={showToast}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-serif text-lg font-light text-[var(--text-primary)]">
                  قائمة القطع المتوفرة بالكتالوج ({products.length})
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  إدارة شاملة لقطع الكوتور، الألوان المخصصة وصورها ومخزونها.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingProduct(true)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-105 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة قطعة كوتور جديدة (استوديو متعدد الألوان)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-sm hover:border-[var(--accent-gold)]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden relative bg-[var(--bg-secondary)] mb-3">
                    <img
                      src={
                        product.pictureUrl ||
                        product.images?.[0] ||
                        'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 text-[10px] font-bold bg-black/70 backdrop-blur-md text-[var(--accent-gold)] px-2.5 py-1 rounded-full border border-[var(--accent-gold)]/30">
                      #{product.id}
                    </span>
                    {product.discount && product.discount > 0 ? (
                      <span className="absolute top-3 left-3 text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-md">
                        -{product.discount}%
                      </span>
                    ) : null}
                  </div>

                  <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                    {product.categoryName || 'عبايات'}
                  </span>
                  <h4 className="font-serif text-base font-semibold text-[var(--text-primary)] mt-0.5 line-clamp-1">
                    {product.name}
                  </h4>
                  {product.discount && product.discount > 0 ? (
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif text-sm font-bold text-emerald-400">
                        {formatPrice(product.finalPrice ?? Number((product.price * (1 - product.discount / 100)).toFixed(2)))}
                      </span>
                      <span className="line-through text-xs text-[var(--text-secondary)]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ) : (
                    <p className="font-serif text-sm font-bold text-[var(--accent-gold)] mt-1">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>

                {/* Stock across variants */}
                <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">المخزون الحالي:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.variants?.map((v) => (
                      <span
                        key={v.id}
                        className={`text-[10px] px-2 py-0.5 rounded-md border ${
                          v.stockQuantity > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {v.color} ({v.size}): {v.stockQuantity} قطعة
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href={`/product/${product.id}`}
                      target="_blank"
                      className="text-xs text-[var(--accent-gold)] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة في المتجر</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(product)}
                        className="px-3 py-1.5 rounded-xl bg-[var(--accent-gold)]/10 hover:bg-[var(--accent-gold)]/20 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="تعديل بيانات ومقاسات ومخزون القطعة"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    )}

      {/* ============================================================== */}
      {/* 3. CATEGORIES TAB */}
      {/* ============================================================== */}
      {activeTab === 'categories' && (
        <div className="max-w-3xl space-y-6">
          {/* Add Category Form */}
          <form onSubmit={handleCreateCategory} className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <h3 className="font-serif text-lg text-[var(--text-primary)]">إضافة قسم جديد إلى المتجر</h3>
            <div className="flex gap-3">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="اسم القسم (مثال: عبايات مناسبات، طرح ونقابات، كولكشن ملكي)"
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-md shrink-0"
              >
                إضافة القسم
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[var(--accent-gold)] font-bold">#{cat.id}</span>
                  <span className="font-serif text-sm font-semibold text-[var(--text-primary)]">{cat.name}</span>
                </div>
                <span className="text-[var(--text-secondary)]">
                  {cat.productsCount || 0} منتج مرتبط
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. DELIVERY METHODS TAB */}
      {/* ============================================================== */}
      {activeTab === 'delivery' && (
        <div className="max-w-3xl space-y-6">
          <form onSubmit={handleCreateDelivery} className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <h3 className="font-serif text-lg text-[var(--text-primary)]">إضافة شركة شحن وتوصيل جديدة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={newDeliveryName}
                onChange={(e) => setNewDeliveryName(e.target.value)}
                placeholder="اسم الشركة (مثال: أرامكس إكسبريس)"
                className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)]"
              />
              <input
                type="number"
                required
                value={newDeliveryCost}
                onChange={(e) => setNewDeliveryCost(e.target.value)}
                placeholder="تكلفة الشحن بالجنيه المصري (مثال: 50)"
                className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={newDeliveryDesc}
                onChange={(e) => setNewDeliveryDesc(e.target.value)}
                placeholder="الوصف (مثال: شحن سريع حتى باب المنزل)"
                className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)]"
              />
              <input
                type="text"
                value={newDeliveryTime}
                onChange={(e) => setNewDeliveryTime(e.target.value)}
                placeholder="مدة التوصيل (مثال: خلال 24 - 48 ساعة)"
                className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-md"
            >
              إضافة طريقة الشحن
            </button>
          </form>

          <div className="space-y-3">
            {deliveryMethods.map((dm) => (
              <div
                key={dm.id}
                className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[var(--text-primary)]">{dm.shortName}</h4>
                    <span className="font-serif text-xs font-bold text-[var(--accent-gold)]">
                      {dm.cost === 0 ? 'مجاني' : formatPrice(dm.cost)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">{dm.description}</p>
                  <span className="text-[10px] text-[var(--accent-gold)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>مدة التوصيل: {dm.deliveryTime}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEditDelivery(dm)}
                    className="px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1.5 font-medium text-xs shadow-sm"
                    title="تعديل طريقة الشحن"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDelivery(dm.id, dm.shortName)}
                    className="px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 font-medium text-xs shadow-sm"
                    title="إلغاء وحذف طريقة الشحن"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إلغاء وحذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CUSTOMERS & ROLES TAB */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (
        <div className="max-w-4xl space-y-6">
          <h3 className="font-serif text-lg font-light text-[var(--text-primary)]">
            قائمة العملاء وإدارة الصلاحيات ({customers.length})
          </h3>

          <div className="space-y-3">
            {customers.map((c) => {
              const isAdmin = isCustomerAdmin(c);

              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">{c.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAdmin
                            ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {isAdmin ? 'مدير نظام (Admin)' : 'عميل (User)'}
                      </span>
                      {c.roles && c.roles.length > 0 && (
                        <div className="flex items-center gap-1">
                          {c.roles.map((r, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">{c.email} | {c.phone || 'بدون هاتف'}</p>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleToggleAdminRole(c)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      isAdmin
                        ? 'border border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
                        : 'bg-[var(--accent-gold)] text-black font-bold hover:brightness-105 shadow-md'
                    }`}
                  >
                    {isAdmin ? 'إلغاء صلاحية الأدمن' : 'ترقية إلى Admin'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </main>

        {/* ============================================================== */}
        {/* VERTICAL NAVIGATION SIDEBAR (Stacked vertically on the left)  */}
        {/* ============================================================== */}
        <aside className="w-full lg:w-72 shrink-0 order-1 lg:order-2 space-y-4">
          {/* Mobile Selector Header (< lg) - zero horizontal scroll */}
          <div className="lg:hidden p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                القسم الحالي:
              </span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="px-3.5 py-2 rounded-xl bg-[var(--accent-gold)] text-black font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                {currentTab.icon}
                <span>{currentTab.label}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    mobileNavOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Mobile Expanded List (Vertical Stack) */}
            {mobileNavOpen && (
              <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-subtle)]">
                {navTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full p-3 rounded-xl text-right flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold shadow-md'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {tab.icon}
                        <span className="text-xs font-semibold">{tab.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {tab.alertCount !== undefined && tab.alertCount > 0 && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isActive ? 'bg-black text-[var(--accent-gold)]' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {tab.alertCount} معلق
                          </span>
                        )}
                        {tab.count !== undefined && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                              isActive ? 'bg-black/20 text-black font-bold' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                        {tab.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                              isActive ? 'bg-black/20 text-black' : 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Vertical Menu Panel (Always Visible on lg+ on the Left) */}
          <div className="hidden lg:block sticky top-28 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 shadow-xl space-y-4">
            <div className="px-2 pt-1 pb-2 border-b border-[var(--border-subtle)]/70 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                  أقسام لوحة الإدارة
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)]">تنقل عمودي مباشر بدون تمرير</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20 font-mono">
                7 أقسام
              </span>
            </div>

            {/* Vertical Stack of Navigation Buttons */}
            <nav className="flex flex-col gap-1.5">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full p-3 rounded-2xl text-right flex items-center justify-between transition-all group ${
                      isActive
                        ? 'bg-gradient-to-l from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold shadow-lg shadow-[var(--accent-gold)]/15 scale-[1.01]'
                        : 'bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-black/15 text-black'
                            : 'bg-[var(--bg-surface)] text-[var(--accent-gold)] group-hover:scale-110'
                        }`}
                      >
                        {tab.icon}
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-semibold leading-tight">{tab.label}</span>
                        <span
                          className={`block text-[10px] mt-0.5 ${
                            isActive ? 'text-black/70 font-medium' : 'text-[var(--text-secondary)]/70'
                          }`}
                        >
                          {tab.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {tab.alertCount !== undefined && tab.alertCount > 0 && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse ${
                            isActive
                              ? 'bg-black text-[var(--accent-gold)]'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {tab.alertCount} معلق
                        </span>
                      )}
                      {tab.count !== undefined && (
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded-lg ${
                            isActive
                              ? 'bg-black/20 text-black font-bold'
                              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                      {tab.badge && (
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                            isActive
                              ? 'bg-black/20 text-black'
                              : 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Quick Footer Actions */}
            <div className="pt-3 border-t border-[var(--border-subtle)]/70 space-y-2">
              <Link
                href="/shop"
                className="w-full py-2.5 px-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--accent-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] border border-[var(--border-subtle)]/70 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>زيارة المتجر المباشر</span>
                </span>
                <span className="text-[10px] font-mono">/shop →</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ============================================================== */}
      {/* MODAL: VIEW RECEIPT SCREENSHOT IN HIGH RESOLUTION */}
      {/* ============================================================== */}
      {activeReceiptModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="font-serif text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>فحص سكرين شوت إيصال التحويل (إنستاباي / فودافون كاش)</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveReceiptModalUrl(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/40">
              <img
                src={activeReceiptModalUrl}
                alt="Payment Receipt Full"
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <a
                href={activeReceiptModalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent-gold)] hover:underline flex items-center gap-1.5"
              >
                <span>فتح الصورة الأصلية بالحجم الكامل</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setActiveReceiptModalUrl(null)}
                className="px-6 py-2 rounded-full bg-[var(--accent-gold)] text-black text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CANCEL ORDER REASON PROMPT */}
      {/* ============================================================== */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
              إلغاء الطلب #{cancelModalOrder.id} وإرجاع المخزون
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              عند الإلغاء، سيتم إرجاع جميع كميات القطع إلى المخزون تلقائياً على السيرفر. يرجى توضيح سبب الإلغاء (مثال: عدم صحة التحويل، رفض العميل، إلخ):
            </p>

            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="اكتب سبب إلغاء الطلب هنا..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-rose-500 rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-5 py-2.5 rounded-full border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)]"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmCancelOrder}
                className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition-colors"
              >
                تأكيد الإلغاء واسترجاع المخزون
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT DELIVERY METHOD */}
      {/* ============================================================== */}
      {isEditDeliveryModalOpen && editingDelivery && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>تعديل شركة الشحن والتوصيل</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditDeliveryModalOpen(false);
                  setEditingDelivery(null);
                }}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDelivery} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">اسم شركة الشحن *</label>
                <input
                  type="text"
                  required
                  value={editDeliveryName}
                  onChange={(e) => setEditDeliveryName(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">تكلفة الشحن (بالجنيه المصري) *</label>
                <input
                  type="number"
                  required
                  value={editDeliveryCost}
                  onChange={(e) => setEditDeliveryCost(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">الوصف</label>
                <input
                  type="text"
                  value={editDeliveryDesc}
                  onChange={(e) => setEditDeliveryDesc(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">مدة التوصيل التقريبية</label>
                <input
                  type="text"
                  value={editDeliveryTime}
                  onChange={(e) => setEditDeliveryTime(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditDeliveryModalOpen(false);
                    setEditingDelivery(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-md"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

