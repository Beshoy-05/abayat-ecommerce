'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check, ShoppingBag, Eye, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, ColorGroup, SizeStock } from '@/types/api';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { language, formatPrice } = useThemeStore();
  const t = translations[language];

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeStock | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const colorGroups: ColorGroup[] = product?.colorGroups || [];
  const hasDiscount = Boolean(product?.discount && product.discount > 0);
  const finalPrice = product?.finalPrice ?? (hasDiscount ? Number(((product?.price || 0) * (1 - (product?.discount || 0) / 100)).toFixed(2)) : (product?.price || 0));
  const defaultFallbackImage =
    product?.pictureUrl ||
    product?.images?.[0] ||
    'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg';

  const currentColorGroup = colorGroups[selectedColorIndex] || {
    color: 'Default',
    images: (product?.images && product.images.length > 0) ? product.images : [defaultFallbackImage],
    sizes: product?.variants?.map((v) => ({ variantId: v.id, size: v.size, stockQuantity: v.stockQuantity })) || [],
  };

  const images = (currentColorGroup.images && currentColorGroup.images.length > 0) ? currentColorGroup.images : [defaultFallbackImage];
  const activeImage = images[activeImageIndex] || defaultFallbackImage;
  const currentSizes = currentColorGroup.sizes || [];

  // Auto-flip in quick view modal
  useEffect(() => {
    if (!isOpen || images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isOpen, images.length]);

  if (!product) return null;

  const handleSelectColor = (index: number) => {
    setSelectedColorIndex(index);
    setActiveImageIndex(0);
    setSelectedSize(null);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setFeedbackMsg(language === 'ar' ? 'يرجى اختيار المقاس أولاً' : 'Please select a size first');
      return;
    }

    const matchedVariant = product.variants?.find((v) => v.id === selectedSize.variantId) || {
      id: selectedSize.variantId,
      productId: product.id,
      color: currentColorGroup.color,
      size: selectedSize.size,
      stockQuantity: selectedSize.stockQuantity,
      images,
    };

    setIsAdding(true);
    const res = await addItem({
      product,
      variant: matchedVariant,
      quantity: 1,
      isAuthenticated,
    });
    setIsAdding(false);

    if (res.success) {
      onClose();
    } else {
      setFeedbackMsg(res.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-[var(--bg-surface)]/80 backdrop-blur-sm border border-[var(--border-subtle)]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Image Gallery */}
            <div className="p-6 bg-[var(--bg-secondary)] flex flex-col justify-between">
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-[var(--bg-primary)] group/modal-img" style={{ position: 'relative' }}>
                <Image
                  src={activeImage || 'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-500"
                />
                {hasDiscount && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-rose-600 text-white shadow-md z-10">
                    {language === 'ar' ? `خصم ${product.discount}%` : `-${product.discount}%`}
                  </span>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      aria-label="Previous Image"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[var(--accent-gold)] hover:text-black text-white/90 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover/modal-img:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      aria-label="Next Image"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[var(--accent-gold)] hover:text-black text-white/90 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover/modal-img:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      style={{ position: 'relative' }}
                      className={`w-14 h-16 rounded-lg relative flex-shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[var(--accent-gold)] scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} - مصغرة ${idx + 1}`} fill className="object-cover rounded-md" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Variant & Add to bag */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[var(--accent-gold)]">
                  {product.categoryName || 'Haute Couture'}
                </span>
                <h3 className="font-serif text-2xl font-light text-[var(--text-primary)] mt-1">
                  {product.name}
                </h3>
                {hasDiscount ? (
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(finalPrice)}
                    </span>
                    <span className="line-through text-base text-gray-400 dark:text-gray-500">
                      {formatPrice(product.price)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      {language === 'ar' ? `خصم ${product.discount}%` : `-${product.discount}%`}
                    </span>
                  </div>
                ) : (
                  <p className="font-serif text-xl font-bold text-[var(--accent-gold)] mt-2">
                    {formatPrice(product.price)}
                  </p>
                )}

                {/* Color Selection */}
                {colorGroups.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2">
                      {t.pdp.selectColor}: <span className="text-[var(--text-primary)]">{currentColorGroup.color}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colorGroups.map((cg, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectColor(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selectedColorIndex === idx
                              ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-bold'
                              : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]'
                          }`}
                        >
                          {cg.color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection (Golden Rule #9 & #13) */}
                <div className="mt-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      {t.pdp.selectSize}
                    </label>
                    {selectedSize && (
                      <span className="text-[11px] font-semibold text-[var(--accent-gold)]">
                        {selectedSize.stockQuantity > 0
                          ? t.card.limitedStock.replace('{count}', selectedSize.stockQuantity.toString())
                          : t.card.outOfStock}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {currentSizes.map((s) => {
                      const isOutOfStock = s.stockQuantity <= 0;
                      const isSelected = selectedSize?.variantId === s.variantId;
                      return (
                        <button
                          key={s.variantId}
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(s)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                            isOutOfStock
                              ? 'opacity-30 border-dashed border-[var(--border-subtle)] cursor-not-allowed line-through'
                              : isSelected
                              ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black font-bold shadow-md'
                              : 'border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-primary)]'
                          }`}
                        >
                          {s.size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {feedbackMsg && (
                  <p className="text-xs text-rose-400 mt-3 font-medium">{feedbackMsg}</p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAdding ? t.pdp.adding : t.pdp.addToBag}</span>
                </button>

                <Link
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-full border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{language === 'ar' ? 'عرض الصفحة الكاملة والتفاصيل' : 'View Full Details & Reviews'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
