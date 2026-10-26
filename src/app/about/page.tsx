'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Sparkles, Gem, ShieldCheck, ArrowRight } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export default function AboutPage() {
  const { language } = useThemeStore();
  const { settings } = useSiteSettingsStore();

  const brandStory =
    settings.aboutUs ||
    (language === 'ar'
      ? 'تأسست دار الأناقة لتعيد صياغة مفهوم العباية التقليدية لتصبح قطعة كوتور فنية نادرة تحتفي بأنوثة المرأة الخليجية ورقيها.'
      : 'Founded in Riyadh, L\'Élégance was born to redefine the traditional silhouette into an heirloom piece of haute couture that honors discerning GCC royal tastes.');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-24">
      {/* Narrative Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <ShimmerBadge icon={<Crown className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'تاريخ الدار الملكية' : 'The Haute Couture Atelier'}
        </ShimmerBadge>
        <h1 className="font-serif text-4xl sm:text-6xl font-light text-[var(--text-primary)] leading-tight">
          {language === 'ar'
            ? 'أصالة الحرفة وقمة الفخامة العربية المعاصرة'
            : 'The Zenith of Modern Arabian Elegance'}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed whitespace-pre-line">
          {brandStory}
        </p>
      </div>

      {/* Visual Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl" style={{ position: 'relative' }}>
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80"
            alt="Atelier Craftsmanship"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="font-serif text-3xl font-light text-[var(--text-primary)]">
            {language === 'ar' ? 'فلسفة الأقمشة والخيوط النادرة' : 'The Fabric Philosophy'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">
            {language === 'ar'
              ? 'نحن لا نؤمن بالإنتاج الضخم. كل عباية تمر عبر أكثر من 40 ساعة من الحياكة اليدوية، بدءاً من اختيار الحرير الياباني النقي المعالج ليلائم المناخ الخليجي، وحتى أدق تفاصيل تطريز خيوط الذهب والتول الفرنسي.'
              : 'We reject mass production. Each commission passes through 40+ hours of hand-tailoring by master couturiers. Heavyweight Japanese crepes that maintain pristine structure, complemented by authentic metallic gold threadwork.'}
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-widest shadow-lg hover:brightness-105 transition-all"
            >
              <span>{language === 'ar' ? 'استعراض التشكيلة' : 'Explore The Collection'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
