'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { ordersService } from '@/api/orders';
import { parseApiError } from '@/api/client';
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
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4500);
  }, []);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      return;
    }

    ordersService
      .getOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err: unknown) => {
        if (active) {
          console.error(err);
          showToast('error', parseApiError(err));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, showToast, refreshIndex]);

  const handleOpenCancelModal = (order: Order) => {
    setCancelModalOrder(order);
    setCancelReason('');
    setSelectedPreset('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;

    const finalReason = cancelReason.trim() || selectedPreset || (language === 'ar' ? 'طلب العميل إلغاء الطلب' : 'Client requested cancellation');

    try {
      setIsCancelling(true);
      await ordersService.cancelOrder(cancelModalOrder.id, finalReason);
      showToast(
        'success',
        language === 'ar'
          ? `تم إلغاء الطلب #${cancelModalOrder.id} بنجاح وإرجاع القطع للمخزون.`
          : `Order #${cancelModalOrder.id} was successfully cancelled and restocked.`
      );
      setCancelModalOrder(null);
      setRefreshIndex((prev) => prev + 1);
    } catch (err: unknown) {
      console.error(err);
      showToast('error', parseApiError(err));
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase().replace(/[\s_-]/g, '') || '';

    switch (s) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'معتمد وقيد التجهيز' : 'Approved'}</span>
          </span>
        );
      case 'completed':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تم التوصيل' : 'Delivered'}</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Truck className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تم الشحن' : 'Shipped'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'ملغي' : 'Cancelled'}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
            <XCircle className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مرفوض' : 'Rejected'}</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'منتهي الصلاحية' : 'Expired'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'قيد المراجعة والدفع' : 'Pending Review'}</span>
          </span>
        );
    }
  };

  const cancelPresets =
    language === 'ar'
      ? [
          'تغيير المقاس أو تفاصيل القطعة',
          'تم عمل الطلب عن طريق الخطأ',
          'الرغبة في تغيير طريقة الشحن أو العنوان',
          'التأخر في تأكيد الشحن',
        ]
      : [
          'Change size or item details',
          'Placed order by mistake',
          'Need to change address or payment method',
          'Delivery timeline is too long',
        ];

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
          className="inline-block px-8 py-3 rounded-full bg-[var(--accent-gold)] text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          {t.nav.login}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md animate-fade-in ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <ShimmerBadge icon={<Package className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'سجل الطلبات الملكية' : 'Couture Orders'}
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {t.nav.orders}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          {language === 'ar'
            ? 'تتبعي دورة تجهيز واعتماد قطعكِ الملكية مع إمكانية إلغاء الطلبات غير المكتملة.'
            : 'Track atelier crafting, approval, and live dispatches with self-service cancellation.'}
        </p>
      </div>

      {loading ? (
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-[var(--bg-surface)] shimmer-anim border border-[var(--border-subtle)]" />
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
            const s = order.status?.toLowerCase().replace(/[\s_-]/g, '') || '';
            // Cancelable only if NOT already cancelled, rejected, expired, completed, or delivered
            const canCancel = !['cancelled', 'rejected', 'expired', 'completed', 'delivered'].includes(s);

            return (
              <div
                key={order.id}
                className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm hover:border-[var(--accent-gold)]/30 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      {language === 'ar' ? 'رقم الطلب المرجعي' : 'Order Reference'}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[var(--accent-gold)]">
                      #{order.id}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString(
                            language === 'ar' ? 'ar-EG' : 'en-US',
                            { dateStyle: 'medium' }
                          )
                        : 'Recent'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(order.status)}

                    {canCancel && (
                      <button
                        onClick={() => handleOpenCancelModal(order)}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline underline-offset-4 transition-colors"
                      >
                        {language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Rejection / Cancellation Reason Banner (If present) */}
                {order.cancellationReason && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-200 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-rose-300 block">
                        {s === 'rejected'
                          ? language === 'ar'
                            ? 'سبب رفض الطلب من قبل الإدارة:'
                            : 'Reason for rejection by atelier:'
                          : language === 'ar'
                          ? 'سبب الإلغاء:'
                          : 'Cancellation Reason:'}
                      </span>
                      <p className="text-[12px] text-[var(--text-primary)] leading-relaxed">
                        {order.cancellationReason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3">
                  {itemsList.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1">
                      <div>
                        <p className="font-serif font-medium text-[var(--text-primary)]">
                          {it.productName}
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {it.color} / {language === 'ar' ? 'المقاس' : 'Size'} {it.size} × {it.quantity}
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
                    <span>{language === 'ar' ? 'عنوان التسليم: ' : 'Delivery Address: '}</span>
                    <strong className="text-[var(--text-primary)]">{order.shippingAddress}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">{language === 'ar' ? 'الإجمالي: ' : 'Total: '}</span>
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

      {/* ============================================================== */}
      {/* CANCEL ORDER MODAL */}
      {/* ============================================================== */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setCancelModalOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                {language === 'ar' ? 'تأكيد إلغاء الطلب' : 'Cancel Order Confirmation'}
              </span>
              <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                {language === 'ar' ? `إلغاء الطلب #${cancelModalOrder.id}` : `Cancel Order #${cancelModalOrder.id}`}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'ar'
                  ? 'عند تأكيد الإلغاء، سيتم تحديث حالة الطلب واسترجاع قطع العبايات إلى المخزون تلقائياً.'
                  : 'Upon confirmation, the order will be cancelled and stock will be immediately restored.'}
              </p>
            </div>

            {/* Quick Reason Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                {language === 'ar' ? 'اختاري سبب الإلغاء:' : 'Select cancellation reason:'}
              </label>
              <div className="flex flex-wrap gap-2">
                {cancelPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset);
                      setCancelReason(preset);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-colors ${
                      selectedPreset === preset
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                {language === 'ar' ? 'أو اكتبي سبباً مخصصاً:' : 'Or enter custom notes:'}
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  setSelectedPreset('');
                }}
                placeholder={
                  language === 'ar'
                    ? 'اكتبي هنا سبب الإلغاء لمساعدتنا في تحسين خدماتنا...'
                    : 'Provide additional details for the atelier...'
                }
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-rose-500 rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancelModalOrder(null)}
                className="px-5 py-2.5 rounded-full border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {language === 'ar' ? 'تراجع' : 'Keep Order'}
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...'}</span>
                  </>
                ) : (
                  <span>{language === 'ar' ? 'تأكيد إلغاء الطلب' : 'Confirm Cancellation'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
