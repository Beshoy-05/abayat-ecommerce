'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, ColorGroup } from '@/types/api';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';

const QuickViewModal = dynamic(() => import('./QuickViewModal'), { ssr: false });

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
  const initialImage =
    product.pictureUrl ||
    product.images?.[0] ||
    'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg';

  const [activeColor, setActiveColor] = useState<string>(colorGroups[0]?.color || '');
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHeartBouncing, setIsHeartBouncing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorited = mounted && wishlistIds.includes(product.id);

  // Compute total available units across all variants
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 10;
  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const finalPrice =
    product.finalPrice ??
    (hasDiscount ? Number((product.price * (1 - (product.discount || 0) / 100)).toFixed(2)) : product.price);

  // Extract all valid images for this card / active color
  const displayedImages = useMemo(() => {
    const list: string[] = [];

    if (activeColor) {
      const matched = colorGroups.find((cg) => cg.color === activeColor);
      if (matched?.images && matched.images.length > 1) {
        list.push(...matched.images);
      } else if (matched?.images && matched.images.length === 1 && (!product.images || product.images.length <= 1)) {
        list.push(...matched.images);
      }
    }

    if (list.length === 0) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        list.push(...product.images);
      }
    }

    if (list.length === 0 && colorGroups.length > 0) {
      colorGroups.forEach((cg) => {
        if (Array.isArray(cg.images)) list.push(...cg.images);
      });
    }

    if (list.length === 0) {
      if (Array.isArray(product.variants)) {
        product.variants.forEach((v) => {
          if (Array.isArray(v.images)) list.push(...v.images);
        });
      }
      if (product.pictureUrl) {
        list.push(product.pictureUrl);
      }
    }

    const unique = Array.from(
      new Set(list.filter((img) => typeof img === 'string' && img.trim().length > 0))
    );

    return unique.length > 0 ? unique.slice(0, 8) : [initialImage];
  }, [activeColor, colorGroups, product.images, product.variants, product.pictureUrl, initialImage]);

  const safeImgIndex = currentImgIndex < displayedImages.length ? currentImgIndex : 0;

  // Auto-flip images on desktop hover (or after user activates carousel) to save mobile bandwidth & battery
  useEffect(() => {
    if (!isHovered || displayedImages.length <= 1) return;
    setCarouselReady(true);

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % displayedImages.length);
    }, 1500);

    return () => clearInterval(timer);
  }, [displayedImages.length, isHovered]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeartBouncing(true);
    setTimeout(() => setIsHeartBouncing(false), 350);
    await toggleFavorite(product, isAuthenticated);
  };

  const handleSwatchHover = (cg: ColorGroup) => {
    setActiveColor(cg.color);
    setCurrentImgIndex(0);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCarouselReady(true);
    setCurrentImgIndex((prev) => (prev - 1 + displayedImages.length) % displayedImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCarouselReady(true);
    setCurrentImgIndex((prev) => (prev + 1) % displayedImages.length);
  };

  const handleSelectDot = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCarouselReady(true);
    setCurrentImgIndex(idx);
  };

  const slidesToRender = carouselReady ? displayedImages : [displayedImages[0]];

  return (
    <>
      <div
        className="group relative flex flex-col rounded-2xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] transition-all duration-500 shadow-sm hover:shadow-xl"
        onMouseEnter={() => {
          setIsHovered(true);
          if (displayedImages.length > 1) setCarouselReady(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Visual Frame / Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--bg-secondary)] block group/card-img">
          <Link
            href={`/product/${product.id}`}
            className="absolute inset-0 block w-full h-full z-0"
            aria-label={product.name}
          >
            {slidesToRender.map((imgUrl, idx) => (
              <Image
                key={`${imgUrl}-${idx}`}
                src={imgUrl}
                alt={`${product.name} - ${product.categoryName || 'عباية ملكية فاخرة'} | دار قصر العباية (صورة ${idx + 1})`}
                fill
                sizes="(max-width: 640px) 360px, (max-width: 1024px) 340px, 280px"
                preload={priority && idx === 0}
                fetchPriority={priority && idx === 0 ? 'high' : undefined}
                loading={priority && idx === 0 ? 'eager' : 'lazy'}
                className={`object-cover transition-opacity duration-500 ease-out group-hover:scale-105 ${
                  idx === safeImgIndex
                    ? 'opacity-100 z-0'
                    : 'opacity-0 pointer-events-none -z-10'
                }`}
              />
            ))}

            {/* Luxury Gradient Vignette Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Link>

          {/* Top Story / Dash Indicators (when multiple images exist) */}
          {displayedImages.length > 1 && (
            <div className="absolute top-1.5 inset-x-3 z-20 flex gap-1.5 items-center pointer-events-none">
              {displayedImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleSelectDot(e, idx)}
                  aria-label={`Image slide ${idx + 1}`}
                  className="pointer-events-auto min-h-[28px] h-7 min-w-[28px] flex-1 flex items-start pt-2 cursor-pointer"
                >
                  <span
                    className={`block w-full h-1 rounded-full transition-all duration-500 ${
                      idx === safeImgIndex
                        ? 'bg-[var(--accent-gold)] shadow-[0_0_8px_rgba(224,185,116,0.8)]'
                        : 'bg-black/40 hover:bg-white/80'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Prev / Next Chevrons on Hover (when multiple images exist) */}
          {displayedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous Image"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[var(--accent-gold)] hover:text-black text-white/90 lg:backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 pointer-events-none group-hover/card-img:opacity-100 group-hover/card-img:pointer-events-auto transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next Image"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[var(--accent-gold)] hover:text-black text-white/90 lg:backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 pointer-events-none group-hover/card-img:opacity-100 group-hover/card-img:pointer-events-auto transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </>
          )}

          {/* Badges */}
          <div
            className={`absolute ${
              displayedImages.length > 1 ? 'top-10' : 'top-3'
            } left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none`}
          >
            {hasDiscount && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-rose-600 text-white shadow-md flex items-center gap-1">
                {language === 'ar' ? `خصم ${product.discount}%` : `-${product.discount}%`}
              </span>
            )}

            {totalStock <= 5 && totalStock > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-black shadow-md lg:backdrop-blur-sm">
                {t.card.limitedStock.replace('{count}', totalStock.toString())}
              </span>
            ) : totalStock > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 text-[var(--accent-gold)] border border-[var(--accent-gold)]/40 shadow-sm lg:backdrop-blur-sm">
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
            className={`absolute ${
              displayedImages.length > 1 ? 'top-10' : 'top-3'
            } right-3 z-20 w-10 h-10 rounded-full bg-[var(--bg-surface)]/90 lg:bg-[var(--bg-surface)]/80 lg:backdrop-blur-md border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:text-rose-500 transition-all shadow-md group-hover:scale-105 cursor-pointer`}
          >
            <span className={`inline-flex transition-transform duration-200 ${isHeartBouncing ? 'scale-125' : 'scale-100'}`}>
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorited ? 'fill-rose-500 text-rose-500' : 'text-[var(--text-primary)]'
                }`}
              />
            </span>
          </button>

          {/* Quick View Button (Reveals on card hover) */}
          <div className="absolute inset-x-4 bottom-4 z-20 translate-y-3 opacity-0 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300">
            <button
              onClick={handleQuickViewClick}
              className="w-full py-2.5 px-4 rounded-full bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.card.quickView}</span>
            </button>
          </div>
        </div>

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
            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              {colorGroups.map((cg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseEnter={() => handleSwatchHover(cg)}
                  onClick={() => handleSwatchHover(cg)}
                  title={cg.color}
                  className={`min-h-[28px] min-w-[28px] px-2.5 py-1 rounded text-[10px] font-medium border transition-all ${
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
            <div className="flex items-baseline gap-2 flex-wrap">
              {hasDiscount ? (
                <>
                  <span className="font-serif text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(finalPrice)}
                  </span>
                  <span className="line-through text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-serif text-base sm:text-lg font-semibold text-[var(--accent-gold)]">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <Link
              href={`/product/${product.id}`}
              className="inline-flex items-center min-h-[28px] text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors"
            >
              {language === 'ar' ? 'التفاصيل ←' : 'Details →'}
            </Link>
          </div>
        </div>
      </div>

      {/* Lazy Quick View Modal — only mounted when opened */}
      {quickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
}
