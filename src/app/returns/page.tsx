'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export default function ReturnsPage() {
  const { language } = useThemeStore();
  const { settings } = useSiteSettingsStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <div className="space-y-3">
        <ShimmerBadge icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Haute Couture Inspection
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {language === 'ar' ? 'الاستبدال والاسترجاع' : '14-Day Luxury Returns & Exchange'}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          {language === 'ar' ? 'حق المعاينة والاستبدال مكفول لمدة 14 يوماً وفق أحكام قانون حماية المستهلك' : '14-Day inspection & exchange guaranteed under Consumer Protection Law'}
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-8 text-xs leading-relaxed text-[var(--text-secondary)] font-light">
        {settings.returnPolicy ? (
          <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed space-y-4">
            {settings.returnPolicy}
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>14-Day Home Fitting Guarantee</span>
              </h2>
              <p>
                We invite you to inspect and try on your garment in the comfort of your home. If the silhouette or length is not entirely perfection, you may initiate a complimentary return or size exchange within 14 calendar days of receiving your courier delivery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                Conditions for Return
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>Garment must remain unworn, unaltered, and free of perfumes or makeup marks.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>Original luxury brand security tags must remain intact and attached.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>Presentation box and travel garment bag must be returned in pristine condition.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                Effortless Courier Pick-Up
              </h2>
              <p>
                Simply contact our Atelier Concierge via WhatsApp. A courier will be scheduled to collect the packaged garment from your doorstep at your convenient time. Refunds are released back to your original payment method within 3 business days of atelier quality verification.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
