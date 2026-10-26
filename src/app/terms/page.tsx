'use client';

import React from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import ShimmerBadge from '@/components/ui/ShimmerBadge';
import { ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  const { language } = useThemeStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="space-y-3">
        <ShimmerBadge icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Legal & Compliance
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          {language === 'ar' ? 'آخر تحديث: 2026 | خاضع لقانون التجارة وحماية المستهلك المصري رقم 181 لسنة 2018' : 'Last updated: 2026 | Compliant with Egyptian Consumer Protection Law No. 181 of 2018'}
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-8 text-xs leading-relaxed text-[var(--text-secondary)] font-light">
        <section className="space-y-3">
          <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
            1. Preamble & Scope
          </h2>
          <p>
            {language === 'ar'
              ? 'أهلاً بكِ في دار الأناقة للهوت كوتور في مصر. عند حجز أو شراء أي من قطع العبايات الملكية، فإنكِ توافقين على هذه الشروط الخاضعة لأحكام القوانين المصرية وقانون حماية المستهلك.'
              : 'Welcome to L\'ÉLÉGANCE Haute Couture Atelier. By ordering bespoke garments via our digital boutique, you agree to these terms governed under Egyptian laws and the Egyptian Consumer Protection Agency directives.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
            2. Bespoke Tailoring & Color Variants
          </h2>
          <p>
            Each silhouette is tailored strictly per the variant matrix (Color & Size length 52–62 inches). While our photographs feature high-definition Cloudinary color fidelity, subtle nuances in silk texture may naturally occur due to artisanal dyeing processes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
            3. Pricing & Currency
          </h2>
          <p>
            All baseline transactions are processed in Saudi Riyals (SAR), with live equivalent conversions for AED, USD, QAR, and KWD. Prices include standard customs processing within GCC territory.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
            4. Intellectual Property
          </h2>
          <p>
            All custom embroidery motifs, silhouette patterns, editorial imagery, and brand emblems remain the exclusive intellectual property of L&apos;ÉLÉGANCE Atelier. Unauthorized reproduction is strictly prohibited.
          </p>
        </section>
      </div>
    </div>
  );
}
