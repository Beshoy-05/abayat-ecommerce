'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export default function CartPage() {
  const { cart, guestItems, removeItem, getSubtotal, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { language, formatPrice } = useThemeStore();
  const t = translations[language];

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const items = isAuthenticated && cart?.items ? cart.items : guestItems;
  const subtotal = getSubtotal();
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'ROYAL10') {
      setDiscountPercent(10);
      setPromoSuccess(true);
      setPromoError(null);
    } else {
      setPromoError(language === 'ar' ? 'رمز القسيمة غير صالح' : 'Invalid promotion voucher');
      setPromoSuccess(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <ShimmerBadge icon={<ShoppingBag className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'حقيبة التسوق الفاخرة' : 'Bespoke Wardrobe'}
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {t.cart.title}
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
            <ShoppingBag className="w-8 h-8 opacity-40" />
          </div>
          <h2 className="font-serif text-xl text-[var(--text-primary)]">{t.cart.empty}</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {t.cart.emptySubtitle}
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-widest shadow-lg hover:brightness-105 transition-all"
            >
              <span>{t.cart.explore}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Items Table / List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm hover:border-[var(--accent-gold)]/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-28 rounded-xl bg-[var(--bg-secondary)] overflow-hidden relative flex-shrink-0" style={{ position: 'relative' }}>
                    <Image
                      src={
                        item.pictureUrl ||
                        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)] font-bold">
                      Haute Couture
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-light text-[var(--text-primary)]">
                      {item.productName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="px-2.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                        {item.color}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                        Size {item.size}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                  <div className="text-left sm:text-right">
                    <span className="font-serif text-lg font-bold text-[var(--accent-gold)]">
                      {formatPrice(item.totalPrice)}
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id, isAuthenticated)}
                    className="p-2 text-[var(--text-secondary)] hover:text-rose-400 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-1.5 text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.cart.remove}</span>
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--accent-gold)] font-semibold hover:underline"
              >
                <span>← {t.cart.continueShopping}</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-xl sticky top-28">
            <h3 className="font-serif text-xl font-light text-[var(--text-primary)] pb-4 border-b border-[var(--border-subtle)]">
              {language === 'ar' ? 'ملخص الطلب الملكي' : 'Order Summary'}
            </h3>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                {language === 'ar' ? 'قسيمة الشراء والخصم' : 'Atelier Privilege Code'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. ROYAL10"
                  className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] uppercase focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-xs font-bold text-[var(--accent-gold)] transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoSuccess && (
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تم تطبيق خصم 10% بنجاح' : '10% Atelier Discount Applied'}</span>
                </p>
              )}
              {promoError && <p className="text-[11px] text-rose-400">{promoError}</p>}
            </form>

            {/* Financial Rows */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)] text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>{t.cart.subtotal}</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>{language === 'ar' ? `خصم خاص (${discountPercent}%)` : `Privilege Discount (${discountPercent}%)`}</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>{language === 'ar' ? 'الشحن السريع' : 'Express Courier'}</span>
                <span className="text-[var(--accent-gold)] font-bold">
                  {language === 'ar' ? 'مجاني' : 'Complimentary'}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-baseline">
                <span className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                  {language === 'ar' ? 'المجموع الإجمالي' : 'Total Amount'}
                </span>
                <span className="font-serif text-2xl font-bold text-[var(--accent-gold)]">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <span>{t.cart.checkout}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>

            <div className="flex items-center gap-2 justify-center text-[11px] text-[var(--text-secondary)]">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>{language === 'ar' ? 'دفع آمن ومشفر 100%' : '100% Encrypted & Authentic Silks'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
