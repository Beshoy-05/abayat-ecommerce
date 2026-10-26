'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Truck, Clock, CheckCircle2, XCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { ordersService } from '@/api/orders';
import { Order } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const { language, formatPrice } = useThemeStore();
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    ordersService
      .getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleCancel = async (orderId: number) => {
    if (!confirm(language === 'ar' ? 'هل أنتِ متأكدة من إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingId(orderId);
      await ordersService.cancelOrder(orderId, 'Client requested cancellation');
      const updated = await ordersService.getOrders();
      setOrders(updated);
    } catch {
      alert(language === 'ar' ? 'تعذر إلغاء الطلب حالياً' : 'Could not cancel order at this stage');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-24 p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
        <Package className="w-12 h-12 mx-auto text-[var(--accent-gold)]" />
        <h2 className="font-serif text-2xl text-[var(--text-primary)]">
          {language === 'ar' ? 'سجلي دخولكِ لعرض طلباتكِ' : 'Sign in to View Your Orders'}
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          {language === 'ar' ? 'تتبعي حالة الشحنات والطلبات السابقة من هنا.' : 'Track live couriers and order history.'}
        </p>
        <Link
          href="/login?redirect=/orders"
          className="inline-block px-8 py-3 rounded-full bg-[var(--accent-gold)] text-black text-xs font-bold uppercase tracking-wider"
        >
          {t.nav.login}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <ShimmerBadge icon={<Package className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'سجل الطلبات' : 'Client Orders'}
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {t.nav.orders}
        </h1>
      </div>

      {loading ? (
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 rounded-2xl bg-[var(--bg-surface)] shimmer-anim" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
          <p className="font-serif text-xl text-[var(--text-primary)]">
            {language === 'ar' ? 'لا توجد طلبات سابقة حتى الآن' : 'No Order History Yet'}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === 'ar' ? 'تصفحي مجموعاتنا الملكية واختاري عبايتكِ الأولى.' : 'Browse our collections to place your first couture commission.'}
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 rounded-full bg-[var(--accent-gold)] text-black text-xs font-bold uppercase tracking-wider"
          >
            {t.cart.explore}
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {orders.map((order) => {
            const itemsList = order.items || order.orderItems || [];
            const isPending = order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'processing';
            return (
              <div
                key={order.id}
                className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      Order Reference
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[var(--accent-gold)]">
                      #{order.id}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    {isPending && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="text-xs text-rose-400 hover:underline font-semibold"
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {itemsList.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-serif font-medium text-[var(--text-primary)]">
                          {it.productName}
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {it.color} / Size {it.size} × {it.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-[var(--accent-gold)]">
                        {formatPrice(it.totalPrice || it.unitPrice * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Details Footer */}
                <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                  <div className="text-[var(--text-secondary)]">
                    <span>Delivery Address: </span>
                    <strong className="text-[var(--text-primary)]">{order.shippingAddress}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Total: </span>
                    <strong className="font-serif text-base text-[var(--accent-gold)]">
                      {formatPrice(order.totalAmount || order.total || order.subtotal || 0)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
