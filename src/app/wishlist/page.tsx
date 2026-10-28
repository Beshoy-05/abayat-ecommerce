'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import ProductCard from '@/components/ui/ProductCard';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export default function WishlistPage() {
  const { wishlistProducts, fetchFavorites, isLoading } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { language } = useThemeStore();
  const t = translations[language];

  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('abaya_auth_token'));
    if (isAuthenticated || hasToken) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  const displayProducts = wishlistProducts.filter(
    (p, index, self) => p && p.id > 0 && index === self.findIndex((item) => item?.id === p.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <ShimmerBadge icon={<Heart className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'المفضلة الملكية' : 'Curated Favorites'}
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {t.nav.wishlist}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          {language === 'ar'
            ? 'احفظي تصاميمكِ المفضلة للعودة إليها أو حجزها في أي وقت'
            : 'Your personal collection of coveted haute couture silhouettes'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-96 rounded-3xl bg-[var(--bg-surface)] shimmer-anim border border-[var(--border-subtle)]"
            />
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
            <Heart className="w-8 h-8 opacity-40" />
          </div>
          <h2 className="font-serif text-xl text-[var(--text-primary)]">
            {language === 'ar' ? 'قائمة المفضلة فارغة حالياً' : 'Your Wishlist is Empty'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === 'ar'
              ? 'انقري على رمز القلب على أي عباية لإضافتها هنا.'
              : 'Click the heart icon on any haute couture piece to save it here.'}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((p, idx) => (
            <ProductCard key={p.id ? `fav-prod-${p.id}` : `fav-idx-${idx}`} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
