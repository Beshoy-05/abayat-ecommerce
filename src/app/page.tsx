'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Gem,
  MessageCircle,
  Star,
  ChevronRight,
  Crown,
} from 'lucide-react';
import { productsService } from '@/api/products';
import { categoriesService } from '@/api/categories';
import { Product, Category } from '@/types/api';
import { useThemeStore } from '@/store/useThemeStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { translations } from '@/utils/translations';
import ProductCard from '@/components/ui/ProductCard';
import ShimmerBadge from '@/components/ui/ShimmerBadge';
import SpotlightCard from '@/components/ui/SpotlightCard';
import MagneticButton from '@/components/ui/MagneticButton';
import ShinyText from '@/components/ui/ShinyText';
import gsap from 'gsap';

export default function HomePage() {
  const { language, formatPrice } = useThemeStore();
  const { settings, fetchSettings } = useSiteSettingsStore();
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    // GSAP Hero Entrance Timeline
    const ctx = gsap.context(() => {
      gsap.from(heroTitleRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2,
      });
      gsap.from(heroSubRef.current, {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.4,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productsService.getProducts({ pageSize: 8 }),
          categoriesService.getCategories(),
        ]);
        setProducts(prodRes.data || []);
        setCategories(catRes || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const perks = [
    {
      icon: <Truck className="w-5 h-5 text-[var(--accent-gold)]" />,
      title: t.perks.delivery,
      desc: t.perks.deliveryDesc,
    },
    {
      icon: <Gem className="w-5 h-5 text-[var(--accent-gold)]" />,
      title: t.perks.craft,
      desc: t.perks.craftDesc,
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[var(--accent-gold)]" />,
      title: t.perks.guarantee,
      desc: t.perks.guaranteeDesc,
    },
    {
      icon: <Crown className="w-5 h-5 text-[var(--accent-gold)]" />,
      title: t.perks.concierge,
      desc: t.perks.conciergeDesc,
    },
  ];

  const currentBadge = mounted ? (settings.heroBadge || t.hero.badge) : t.hero.badge;
  const currentTitle = mounted ? (settings.heroTitle || t.hero.title) : t.hero.title;
  const currentSubtitle = mounted ? (settings.heroSubtitle || t.hero.subtitle) : t.hero.subtitle;
  const currentImageUrl = mounted
    ? (settings.heroImageUrl || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85")
    : "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85";
  const currentCardTag = mounted
    ? (settings.heroCardTag || (language === 'ar' ? 'تشكيلة الموسم' : 'Runway Piece'))
    : (language === 'ar' ? 'تشكيلة الموسم' : 'Runway Piece');
  const currentCardTitle = mounted
    ? (settings.heroCardTitle || (language === 'ar' ? 'عباية الحرير الملكي المطرزة' : 'Royal Embroidered Silk Abaya'))
    : (language === 'ar' ? 'عباية الحرير الملكي المطرزة' : 'Royal Embroidered Silk Abaya');

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 👑 1. HAUTE-COUTURE EDITORIAL HERO */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12 pb-20"
      >
        {/* Ambient Gold Radial Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(224,185,116,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Narrative */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
            <ShimmerBadge icon={<Sparkles className="w-3.5 h-3.5" />}>
              {currentBadge}
            </ShimmerBadge>

            <h1
              ref={heroTitleRef}
              suppressHydrationWarning
              className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light tracking-tight text-[var(--text-primary)] leading-[1.1]"
            >
              <ShinyText text={currentTitle} />
            </h1>

            <p
              ref={heroSubRef}
              suppressHydrationWarning
              className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
            >
              {currentSubtitle}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start rtl:lg:justify-start gap-4">
              <MagneticButton>
                <Link
                  href="/shop"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:brightness-110 transition-all flex items-center gap-3"
                >
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </MagneticButton>

              <Link
                href="/contact"
                className="px-8 py-4 rounded-full border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] text-xs uppercase tracking-[0.2em] font-semibold transition-all backdrop-blur-md"
              >
                {t.hero.ctaSecondary}
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="font-serif text-2xl font-bold text-[var(--accent-gold)]">100%</p>
                <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">
                  {language === 'ar' ? 'حرير طبيعي' : 'Pure Silk'}
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[var(--accent-gold)]">1-2</p>
                <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">
                  {language === 'ar' ? 'أيام توصيل بمصر' : 'Days Courier Egypt'}
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[var(--accent-gold)]">24/7</p>
                <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">
                  {language === 'ar' ? 'خدمة العملاء' : 'Customer Care'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 rounded-3xl border border-[var(--accent-gold)]/20 rotate-1 pointer-events-none" />

              <div className="aspect-[3/4] rounded-2xl overflow-hidden relative shadow-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]" style={{ position: 'relative' }}>
                <Image
                  src={currentImageUrl}
                  alt={currentTitle}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />

                {/* Floating Card Snippet */}
                <div className="absolute bottom-6 inset-x-6 p-4 rounded-xl bg-[var(--bg-surface)]/85 backdrop-blur-xl border border-[var(--border-subtle)] shadow-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[var(--accent-gold)] font-bold">
                      {currentCardTag}
                    </span>
                    <h3 className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                      {currentCardTitle}
                    </h3>
                  </div>
                  <Link
                    href="/shop"
                    className="w-9 h-9 rounded-full bg-[var(--accent-gold)] text-black flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⚜️ 2. BESPOKE GCC VALUE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, idx) => (
            <SpotlightCard key={idx} className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
                {perk.icon}
              </div>
              <h3 className="font-serif text-base font-semibold text-[var(--text-primary)] mb-1">
                {perk.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {perk.desc}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 👗 3. CURATED RUNWAY COLLECTIONS (LIVE PRODUCTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <ShimmerBadge icon={<Crown className="w-3.5 h-3.5" />}>
              {language === 'ar' ? 'التشكيلة المختارة' : 'Atelier Selections'}
            </ShimmerBadge>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-[var(--text-primary)] mt-3">
              {t.catalog.title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl font-light">
              {t.catalog.subtitle}
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-gold)] hover:text-[var(--accent-bronze)] transition-colors self-start md:self-end"
          >
            <span>{language === 'ar' ? 'عرض الكتالوج الكامل' : 'Explore All Pieces'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[3/4] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shimmer-anim"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
            <p className="text-[var(--text-secondary)] text-sm">{t.catalog.noResults}</p>
          </div>
        )}
      </section>

      {/* 🧵 4. THE ATELIER CRAFTSMANSHIP NARRATIVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
          <div className="lg:col-span-6 relative aspect-square lg:aspect-auto min-h-[400px]" style={{ position: 'relative' }}>
            <Image
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80"
              alt="Silk Atelier Craftsmanship"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent lg:hidden" />
          </div>

          <div className="lg:col-span-6 p-8 sm:p-14 flex flex-col justify-center space-y-6">
            <ShimmerBadge icon={<Gem className="w-3.5 h-3.5" />}>
              {language === 'ar' ? 'أسرار الحرفة الملكية' : 'Artisanal Heritage'}
            </ShimmerBadge>

            <h2 className="text-3xl sm:text-4xl font-serif font-light text-[var(--text-primary)] leading-snug">
              {language === 'ar'
                ? 'حياكة يدوية متقنة بأفخم خيوط القصب والذهب الخالص'
                : 'Heirloom Gold Threadwork & Pure Japanese Raw Crepe'}
            </h2>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">
              {language === 'ar'
                ? 'في دار الأناقة، تبدأ كل عباية كلوحة فنية نادرة. ننتقي أفخم أقمشة الكريب الياباني الفاخر والحرير الطبيعي الإيطالي، ثم ينسج أساتذة الحرفة خيوط الذهب المعدنية وتطريزات الدانتيل الفرنسي بدقة متناهية لتتألقي بأبهى إطلالة في كل مناسبة.'
                : 'Every silhouette created in our atelier is a symphony of rare fabrics. We source the finest heavyweight Japanese crepes, woven with fluid drape and breathability, complemented by hand-guided metallic gold threading and authentic Chantilly lace.'}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-[var(--text-primary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>{language === 'ar' ? 'أقمشة كريب ياباني ملكي لا تبهت مع الزمن' : 'Royal Japanese Crepes with Zero Fade'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--text-primary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>{language === 'ar' ? 'خياطة يدوية مزدوجة مع تطريز دانتيل فرنسي' : 'French Chantilly Lace with Double-Locked French Seams'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--text-primary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>{language === 'ar' ? 'تفصيل خاص حسب المقاس الخليجي الدقيق' : 'Bespoke GCC Height & Sleeve Tailoring'}</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-gold)] hover:text-[var(--accent-bronze)] transition-colors"
              >
                <span>{language === 'ar' ? 'اكتشفي قصة الدار الكاملة' : 'Discover Our Story'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 💳 5. VERIFIED PAYMENT & ATELIER ASSURANCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 sm:p-12 shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <ShimmerBadge icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              {language === 'ar' ? 'طرق الدفع والتوصيل المعتمدة' : 'Official Payment & Guarantee'}
            </ShimmerBadge>
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-[var(--text-primary)]">
              {language === 'ar' ? 'دفع آمن وفحص كامل للقطعة قبل الاستلام' : 'Secured Payments & Inspection Guarantee'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {language === 'ar'
                ? 'نوفر لكِ وسائل دفع فورية معتمدة في مصر عبر إنستاباي وفودافون كاش والدفع عند الاستلام مع ضمان المعاينة الكاملة'
                : 'Enjoy instant verified payments via InstaPay, Vodafone Cash, or Cash on Delivery with full inspection rights.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-semibold text-[var(--text-primary)]">إنستاباي (InstaPay)</span>
                <span className="text-[10px] text-[var(--accent-gold)] font-bold bg-[var(--accent-gold)]/10 px-2 py-0.5 rounded">تحويل لحظي</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'ar'
                  ? 'دفع فوري عبر حساب إنستاباي awadallaalashkar@instapay مع رفع سكرين شوت الإيصال للاعتماد الفوري.'
                  : 'Instant transfer via InstaPay address awadallaalashkar@instapay with receipt verification.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-semibold text-[var(--text-primary)]">فودافون كاش</span>
                <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">محفظة إلكترونية</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'ar'
                  ? 'تحويل مباشر لمحفظة فودافون كاش رقم +20 10 96212029 بدون رسوم إضافية مع اعتماد سريع.'
                  : 'Direct wallet transfer to Vodafone Cash number +20 10 96212029 with zero extra fees.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-semibold text-[var(--text-primary)]">الدفع عند الاستلام والمعاينة</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">حق الفحص</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'ar'
                  ? 'معاينة العباية والتطريز والخامة مع مندوب الشحن قبل سداد المبلغ وفق قانون حماية المستهلك المصري.'
                  : 'Complete inspection of fabrics and embroidery before payment per Egyptian consumer protection law.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
