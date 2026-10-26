'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Sparkles } from 'lucide-react';
import { Product, ColorGroup } from '@/types/api';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import QuickViewModal from './QuickViewModal';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { wishlistIds, toggleFavorite } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { language, formatPrice } = useThemeStore();
  const t = translations[language];

  const colorGroups: ColorGroup[] = product.colorGroups || [];
  const initialImage = product.pictureUrl || product.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';

  const [activeImage, setActiveImage] = useState<string>(initialImage);
  const [activeColor, setActiveColor] = useState<string>(colorGroups[0]?.color || '');
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHeartBouncing, setIsHeartBouncing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorited = mounted && wishlistIds.includes(product.id);

  // Compute total available units across all variants
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 10;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartBouncing(true);
    setTimeout(() => setIsHeartBouncing(false), 500);
    await toggleFavorite(product, isAuthenticated);
  };

  const handleSwatchHover = (cg: ColorGroup) => {
    setActiveColor(cg.color);
    if (cg.images && cg.images.length > 0) {
      setActiveImage(cg.images[0]);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] transition-all duration-500 shadow-sm hover:shadow-xl">
        <Link
          href={`/product/${product.id}`}
          className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--bg-secondary)] block"
          style={{ position: 'relative' }}
        >
          <Image
            src={activeImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Luxury Gradient Vignette Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {totalStock <= 5 && totalStock > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-black shadow-md backdrop-blur-sm">
                {t.card.limitedStock.replace('{count}', totalStock.toString())}
              </span>
            ) : totalStock > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 text-[var(--accent-gold)] border border-[var(--accent-gold)]/40 shadow-sm backdrop-blur-sm">
                {t.card.inStock}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600/90 text-white shadow-md">
                {t.card.outOfStock}
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleFavoriteClick}
            aria-label="Add to Wishlist"
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:text-rose-500 transition-all shadow-md group-hover:scale-105 cursor-pointer"
          >
            <motion.div animate={isHeartBouncing ? { scale: [1, 1.35, 0.9, 1] } : { scale: 1 }}>
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorited ? 'fill-rose-500 text-rose-500' : 'text-[var(--text-primary)]'
                }`}
              />
            </motion.div>
          </button>

          {/* Quick View Button (Reveals on card hover) */}
          <div className="absolute inset-x-4 bottom-4 z-10 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleQuickViewClick}
              className="w-full py-2.5 px-4 rounded-full bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.card.quickView}</span>
            </button>
          </div>
        </Link>

        {/* Content Section */}
        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
          <div>
            {/* Category */}
            <div className="flex items-center justify-between text-[11px] text-[var(--accent-gold)] font-medium uppercase tracking-widest">
              <span>{product.categoryName || 'Haute Couture'}</span>
              {colorGroups.length > 1 && (
                <span className="text-[10px] text-[var(--text-secondary)] lowercase">
                  {t.card.colorOptions.replace('{count}', colorGroups.length.toString())}
                </span>
              )}
            </div>

            {/* Product Name */}
            <Link href={`/product/${product.id}`} className="block mt-1">
              <h3 className="font-serif text-base sm:text-lg font-light text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Interactive Color Swatches */}
          {colorGroups.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {colorGroups.map((cg, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => handleSwatchHover(cg)}
                  onClick={() => handleSwatchHover(cg)}
                  title={cg.color}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                    activeColor === cg.color
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-bold'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]'
                  }`}
                >
                  {cg.color}
                </button>
              ))}
            </div>
          )}

          {/* Price & Action */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="font-serif text-base sm:text-lg font-semibold text-[var(--accent-gold)]">
              {formatPrice(product.price)}
            </span>

            <Link
              href={`/product/${product.id}`}
              className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors"
            >
              {language === 'ar' ? 'التفاصيل ←' : 'Details →'}
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
