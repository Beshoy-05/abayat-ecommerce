'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  Share2,
  Ruler,
  ShieldCheck,
  Truck,
  Sparkles,
  Star,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { productsService } from '@/api/products';
import { reviewsService } from '@/api/reviews';
import { Product, ColorGroup, SizeStock, ReviewsResponse } from '@/types/api';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { translations } from '@/utils/translations';
import { trackViewItem } from '@/utils/analytics';
import SizeGuideModal from '@/components/ui/SizeGuideModal';
import ShimmerBadge from '@/components/ui/ShimmerBadge';
import SpotlightCard from '@/components/ui/SpotlightCard';
import ProductCard from '@/components/ui/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { language, formatPrice } = useThemeStore();
  const t = translations[language];

  const { addItem } = useCartStore();
  const { wishlistIds, toggleFavorite } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { settings } = useSiteSettingsStore();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (product?.name) {
      const store = settings.storeName?.trim() || t.brandName;
      document.title = `${product.name} | ${store}`;
    }
  }, [product?.name, settings.storeName, t.brandName]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Variant selection states (Strict Golden Rule #13)
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<SizeStock | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UI Modals & Accordions
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('craft');
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Review Form State (Golden Rule #8)
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewMessage, setReviewMessage] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const mainCtaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProductData = async () => {
      try {
        setLoading(true);
        const data = await productsService.getProductById(id as string);
        setProduct(data);
        trackViewItem(data);

        // Fetch related products & reviews in parallel
        const [related, reviews] = await Promise.allSettled([
          productsService.getProducts({ categoryId: data.categoryId, pageSize: 4 }),
          reviewsService.getProductReviews(id as string),
        ]);

        if (related.status === 'fulfilled') {
          setRelatedProducts(related.value.data.filter((p) => p.id !== data.id));
        }
        if (reviews.status === 'fulfilled') {
          setReviewsData(reviews.value);
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Observer for Sticky Add-to-bag bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!mainCtaRef.current) return;
      const rect = mainCtaRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 animate-pulse space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[3/4] bg-[var(--bg-secondary)] rounded-2xl shimmer-anim" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-6 w-32 bg-[var(--bg-secondary)] rounded-full" />
            <div className="h-10 w-3/4 bg-[var(--bg-secondary)] rounded-xl" />
            <div className="h-8 w-1/3 bg-[var(--bg-secondary)] rounded-xl" />
            <div className="h-28 bg-[var(--bg-secondary)] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto text-center py-32 space-y-4">
        <h2 className="font-serif text-2xl text-[var(--text-primary)]">Couture Piece Not Found</h2>
        <Link href="/shop" className="text-xs uppercase text-[var(--accent-gold)] underline font-bold">
          Return to Collections
        </Link>
      </div>
    );
  }

  // Variant Hierarchy Extraction (Golden Rule #13)
  const colorGroups: ColorGroup[] = product.colorGroups || [];
  const currentColorGroup = colorGroups[selectedColorIdx] || {
    color: 'Standard',
    images: product.images?.length > 0 ? product.images : [product.pictureUrl],
    sizes: product.variants?.map((v) => ({ variantId: v.id, size: v.size, stockQuantity: v.stockQuantity })) || [],
  };

  const images = currentColorGroup.images?.length > 0 ? currentColorGroup.images : [product.pictureUrl];
  const activeImage = images[selectedImageIdx] || product.pictureUrl;
  const currentSizes = currentColorGroup.sizes || [];

  const handleColorChange = (idx: number) => {
    setSelectedColorIdx(idx);
    setSelectedImageIdx(0);
    setSelectedSize(null);
    setQuantity(1);
    setFeedbackMsg(null);
  };

  const handleSizeChange = (s: SizeStock) => {
    setSelectedSize(s);
    setQuantity(1);
    setFeedbackMsg(null);
  };

  // Stock cap logic (Golden Rule #9)
  const maxStock = selectedSize ? selectedSize.stockQuantity : 10;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setFeedbackMsg({
        type: 'error',
        text: language === 'ar' ? 'يرجى اختيار مقاس العباية أولاً' : 'Please select your size first',
      });
      return;
    }

    if (quantity > selectedSize.stockQuantity) {
      setFeedbackMsg({
        type: 'error',
        text: t.cart.stockCapWarning,
      });
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
    // Strict Golden Rule #2 & #4
    const res = await addItem({
      product,
      variant: matchedVariant,
      quantity,
      isAuthenticated,
    });
    setIsAdding(false);

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: t.pdp.addedSuccess });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewError(language === 'ar' ? 'يرجى تسجيل الدخول أولاً لإضافة تقييم' : 'Please sign in to submit a review');
      return;
    }
    if (!reviewMessage.trim()) return;

    try {
      setIsSubmittingReview(true);
      setReviewError(null);
      await reviewsService.createReview({
        productId: product.id,
        stars: reviewStars,
        message: reviewMessage.trim(),
      });
      setReviewSuccess(true);
      setReviewMessage('');
      // refresh reviews
      const updated = await reviewsService.getProductReviews(product.id);
      setReviewsData(updated);
    } catch (err: unknown) {
      // Golden Rule #8 (Duplicate Review 409 Conflict)
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axErr = err as { response?: { status?: number } };
        if (axErr.response?.status === 409) {
          setReviewError(t.pdp.alreadyReviewed);
          return;
        }
      }
      setReviewError(language === 'ar' ? 'تعذر إرسال التقييم، يرجى المحاولة لاحقاً' : 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isFavorited = wishlistIds.includes(product.id);

  // SEO Schema for this Product (JSON-LD Rich Snippet)
  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: product.description,
    sku: `ABAYA-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: settings.storeName?.trim() || "قصر العباية",
    },
    offers: {
      '@type': 'Offer',
      url: `https://abaya-luxury.com/product/${product.id}`,
      priceCurrency: 'SAR',
      price: product.price,
      availability: maxStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: reviewsData?.totalReviews
      ? {
          '@type': 'AggregateRating',
          ratingValue: reviewsData.averageRating,
          reviewCount: reviewsData.totalReviews,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-20">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-wider">
          <Link href="/" className="hover:text-[var(--accent-gold)]">
            {t.nav.home}
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--accent-gold)]">
            {t.nav.shop}
          </Link>
          <span>/</span>
          <span className="text-[var(--accent-gold)] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT: Haute-Couture High-Res Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-xl group" style={{ position: 'relative' }}>
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Wishlist Floating Button */}
              <button
                onClick={() => toggleFavorite(product, isAuthenticated)}
                className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:text-rose-500 transition-all shadow-md"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorited ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    style={{ position: 'relative' }}
                    className={`relative w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImageIdx === idx
                        ? 'border-[var(--accent-gold)] scale-105 shadow-md'
                        : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="Angle thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Bespoke Variant Matrix & Add-To-Bag */}
          <div className="lg:col-span-5 space-y-8 sticky top-28">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <ShimmerBadge icon={<Sparkles className="w-3.5 h-3.5" />}>
                  {product.categoryName || 'Royal Collection'}
                </ShimmerBadge>

                {reviewsData?.totalReviews ? (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--accent-gold)]">
                    <Star className="w-4 h-4 fill-[var(--accent-gold)]" />
                    <span className="font-bold">{reviewsData.averageRating.toFixed(1)}</span>
                    <span className="text-[var(--text-secondary)]">({reviewsData.totalReviews})</span>
                  </div>
                ) : null}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)] leading-tight">
                {product.name}
              </h1>

              <p className="font-serif text-2xl font-bold text-[var(--accent-gold)]">
                {formatPrice(product.price)}
              </p>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Variant Stage 1: Color Selection */}
            {colorGroups.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase tracking-wider font-semibold text-[var(--text-secondary)]">
                    {t.pdp.selectColor}
                  </span>
                  <span className="font-bold text-[var(--accent-gold)]">
                    {currentColorGroup.color}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {colorGroups.map((cg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleColorChange(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                        selectedColorIdx === idx
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-bold shadow-sm'
                          : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]'
                      }`}
                    >
                      {cg.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variant Stage 2: Size Selection (Strict Golden Rule #9 & #13) */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-wider font-semibold text-[var(--text-secondary)]">
                  {t.pdp.selectSize}
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-[var(--accent-gold)] hover:underline font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{t.pdp.sizeGuide}</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {currentSizes.map((s) => {
                  const isOutOfStock = s.stockQuantity <= 0;
                  const isSelected = selectedSize?.variantId === s.variantId;
                  return (
                    <button
                      key={s.variantId}
                      disabled={isOutOfStock}
                      onClick={() => handleSizeChange(s)}
                      className={`py-2.5 text-xs font-semibold rounded-xl border transition-all relative ${
                        isOutOfStock
                          ? 'opacity-30 border-dashed border-[var(--border-subtle)] cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black font-bold shadow-lg'
                          : 'border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{s.size}</span>
                      {s.stockQuantity > 0 && s.stockQuantity <= 3 && (
                        <span className="block text-[8px] opacity-75 font-normal">
                          {s.stockQuantity} left
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stock Badge */}
              {selectedSize && (
                <div className="flex items-center gap-2 text-xs pt-1">
                  {selectedSize.stockQuantity > 0 ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {selectedSize.stockQuantity <= 3
                          ? t.pdp.unitsLeft.replace('{count}', selectedSize.stockQuantity.toString())
                          : t.pdp.inStockBadge}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{t.pdp.outOfStockSize}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Selector (Capped by stockQuantity - Golden Rule #9) */}
            <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)]">
                {t.pdp.quantity}:
              </span>
              <div className="flex items-center border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-secondary)]">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-sm hover:bg-[var(--bg-surface)] disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-[var(--text-primary)]">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= maxStock}
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  className="px-3.5 py-1.5 text-sm hover:bg-[var(--bg-surface)] disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Feedback Message */}
            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            {/* Add to Bag CTA */}
            <div className="space-y-3 pt-2">
              <button
                ref={mainCtaRef}
                onClick={handleAddToCart}
                disabled={Boolean(isAdding || (selectedSize && selectedSize.stockQuantity <= 0))}
                className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:brightness-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAdding ? t.pdp.adding : t.pdp.addToBag}</span>
              </button>

              <div className="pt-2 text-[11px] text-[var(--text-secondary)]">
                <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent-gold)]" />
                  <span>{language === 'ar' ? 'ضمان 14 يوم استرجاع ومعاينة' : '14-Day Return Guarantee'}</span>
                </div>
              </div>
            </div>

            {/* Haute Couture Accordion Tabs */}
            <div className="border-t border-[var(--border-subtle)] pt-6 space-y-3">
              {[
                {
                  id: 'craft',
                  title: t.pdp.tabs.craft,
                  content:
                    language === 'ar'
                      ? 'قماش كريب ياباني ملكي فاخر، انسيابي ومريح ومقاوم للتجعد، مطرز بخيوط القصب المذهبة وحاشية دانتيل فرنسي أصيل.'
                      : 'Handcrafted from heavyweight Japanese royal crepe, featuring fluid drape, breathable texture, and heirloom metallic gold threading.',
                },
                {
                  id: 'sizeFit',
                  title: t.pdp.tabs.sizeFit,
                  content:
                    language === 'ar'
                      ? 'قصة كلاسيكية ملكية مريحة، مع أكمام متناسقة بدقة وحزام داخلي اختياري لضبط المقاس حسب الرغبة.'
                      : 'Designed for a regal, modest silhouette. Fits true to standard GCC Abaya sizing based on overall height in inches (52 to 62).',
                },
                {
                  id: 'shipping',
                  title: t.pdp.tabs.shipping,
                  content:
                    language === 'ar'
                      ? 'شحن وتوصيل فاخر وفقاً لشركة الشحن المختارة مع تغليف الهوت كوتور الملكي الخاص.'
                      : 'Courier delivery in signature atelier packaging according to the selected delivery method.',
                },
              ].map((tab) => (
                <div key={tab.id} className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === tab.id ? null : tab.id)}
                    className="w-full p-4 text-left rtl:text-right flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors"
                  >
                    <span>{tab.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        activeAccordion === tab.id ? 'rotate-180 text-[var(--accent-gold)]' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === tab.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed font-light border-t border-[var(--border-subtle)]/50 pt-3"
                      >
                        {tab.content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REVIEWS & RATINGS SECTION (Strict Golden Rule #8) */}
        <section className="pt-16 border-t border-[var(--border-subtle)] space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <ShimmerBadge icon={<Star className="w-3.5 h-3.5" />}>
                {t.pdp.reviews}
              </ShimmerBadge>
              <h3 className="font-serif text-3xl font-light text-[var(--text-primary)] mt-2">
                {language === 'ar' ? 'تقييمات العميلات الحصرية' : 'Client Impressions & Ratings'}
              </h3>
            </div>

            {reviewsData && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="font-serif text-3xl font-bold text-[var(--accent-gold)]">
                  {reviewsData.averageRating.toFixed(1)}
                </span>
                <div className="text-xs">
                  <div className="flex text-[var(--accent-gold)]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(reviewsData.averageRating)
                            ? 'fill-[var(--accent-gold)]'
                            : 'text-[var(--text-secondary)]/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[var(--text-secondary)]">
                    {reviewsData.totalReviews} {language === 'ar' ? 'تقييمات موثقة' : 'Verified Reviews'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                reviewsData.reviews.map((rev) => (
                  <SpotlightCard key={rev.id} className="p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-[var(--text-primary)]">
                        {rev.customerName || rev.displayName || (language === 'ar' ? 'عميلة موثقة' : 'Verified Client')}
                      </span>
                      <div className="flex text-[var(--accent-gold)]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= rev.stars ? 'fill-[var(--accent-gold)]' : 'text-zinc-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-serif text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                      &ldquo;{rev.message}&rdquo;
                    </p>
                  </SpotlightCard>
                ))
              ) : (
                <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
                  {language === 'ar' ? 'كن أول من يشارك تجربته مع هذه العباية' : 'Be the first to share your couture review'}
                </div>
              )}
            </div>

            {/* Write a Review Form */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
              <h4 className="font-serif text-lg font-light text-[var(--text-primary)]">
                {t.pdp.writeReview}
              </h4>

              {reviewSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  {language === 'ar' ? 'شكراً لكِ! تم تسجيل تقييمكِ بنجاح.' : 'Thank you! Your couture review has been submitted.'}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Star Rating Picker */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 font-semibold">
                      {t.pdp.yourRating}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setReviewStars(s)}
                          className="p-1 text-[var(--accent-gold)] hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${s <= reviewStars ? 'fill-[var(--accent-gold)]' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 font-semibold">
                      {t.pdp.yourReview}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reviewMessage}
                      onChange={(e) => setReviewMessage(e.target.value)}
                      placeholder={language === 'ar' ? 'صفي إحساسكِ بجودة القماش والخياطة...' : 'Describe the fabric drape, embroidery, and fit...'}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-xs text-rose-400 font-semibold">{reviewError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-3 px-6 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent-bronze)] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : t.pdp.submitReview}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* RELATED COUTURE PIECES */}
        {relatedProducts.length > 0 && (
          <section className="pt-16 border-t border-[var(--border-subtle)] space-y-8">
            <h3 className="font-serif text-3xl font-light text-[var(--text-primary)]">
              {language === 'ar' ? 'قطع كوتور قد تنال إعجابكِ' : 'Complementary Atelier Pieces'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 inset-x-0 z-40 lg:hidden p-4 bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)] shadow-2xl flex items-center justify-between gap-4"
          >
            <div>
              <span className="font-serif text-base font-bold text-[var(--accent-gold)]">
                {formatPrice(product.price)}
              </span>
              <span className="block text-[10px] text-[var(--text-secondary)] truncate max-w-[140px]">
                {product.name}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="py-3 px-6 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAdding ? t.pdp.adding : t.pdp.stickyCta}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}
