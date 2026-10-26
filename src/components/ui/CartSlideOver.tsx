'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartSlideOver() {
  const { isCartOpen, closeCart, cart, guestItems, removeItem, getSubtotal, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { language, formatPrice } = useThemeStore();
  const t = translations[language];

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const items = isAuthenticated && cart?.items ? cart.items : guestItems;
  const subtotal = getSubtotal();
  const freeShippingThreshold = 500;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: language === 'ar' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-[var(--accent-gold)]" />
                  <h2 className="font-serif text-xl font-light text-[var(--text-primary)]">
                    {t.cart.title}
                  </h2>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Meter */}
              <div className="px-6 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-xs">
                <div className="flex justify-between items-center mb-1.5 font-medium">
                  <span className="text-[var(--text-primary)]">
                    {progressPercent >= 100
                      ? language === 'ar' ? 'تهانينا! حصلتِ على الشحن السريع المجاني' : 'Complimentary Express Courier Unlocked'
                      : language === 'ar'
                        ? `أضيفي ${formatPrice(freeShippingThreshold - subtotal)} للشحن المجاني`
                        : `Add ${formatPrice(freeShippingThreshold - subtotal)} for Free Courier Delivery`}
                  </span>
                  <span className="text-[var(--accent-gold)] font-bold">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {items.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
                      <ShoppingBag className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="text-base font-serif text-[var(--text-primary)]">{t.cart.empty}</p>
                    <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                      {t.cart.emptySubtitle}
                    </p>
                    <button
                      onClick={closeCart}
                      className="inline-block mt-4 px-6 py-2.5 rounded-full border border-[var(--accent-gold)] text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-wider hover:bg-[var(--accent-gold)] hover:text-black transition-colors"
                    >
                      <Link href="/shop">{t.cart.explore}</Link>
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 relative group"
                    >
                      <div className="w-20 h-24 rounded-lg overflow-hidden bg-[var(--bg-secondary)] relative flex-shrink-0" style={{ position: 'relative' }}>
                        <Image
                          src={item.pictureUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80'}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                            {item.productName}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                            <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                              {item.color}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                              Size {item.size}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-[var(--text-secondary)]">
                            Qty: <strong className="text-[var(--text-primary)]">{item.quantity}</strong>
                          </span>
                          <span className="font-semibold text-sm text-[var(--accent-gold)]">
                            {formatPrice(item.totalPrice)}
                          </span>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(item.id, isAuthenticated)}
                        className="text-[var(--text-secondary)] hover:text-red-400 p-1.5 transition-colors self-start"
                        title={t.cart.remove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout CTA */}
              {items.length > 0 && (
                <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">{t.cart.subtotal}</span>
                      <span className="font-serif text-lg font-bold text-[var(--text-primary)]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--accent-gold)]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.cart.freeShippingNote}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-lg"
                    >
                      <span>{t.cart.checkout}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="w-full py-2.5 px-6 rounded-full border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs uppercase tracking-wider font-semibold flex items-center justify-center hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      {language === 'ar' ? 'عرض تفاصيل الحقيبة' : 'View Full Bag'}
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
