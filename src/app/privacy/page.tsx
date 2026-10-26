'use client';

import React from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import ShimmerBadge from '@/components/ui/ShimmerBadge';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  const { language } = useThemeStore();
  const { settings } = useSiteSettingsStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="space-y-3">
        <ShimmerBadge icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'حماية البيانات والخصوصية' : 'Data Privacy & Protection'}
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {language === 'ar' ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy & Data Protection Policy'}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          {language === 'ar'
            ? 'متوافق مع أعلى معايير أمان البيانات وحماية خصوصية بيانات عملاء الدار'
            : 'Fully compliant with international data protection standards and client confidentiality.'}
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-8 text-xs leading-relaxed text-[var(--text-secondary)] font-light">
        {settings.privacyPolicy ? (
          <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed space-y-4">
            {settings.privacyPolicy}
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                1. Data Collection & Purpose
              </h2>
              <p>
                We collect personal identifiers solely necessary for white-glove courier dispatch and bespoke tailoring consultations: recipient name, shipping address, mobile contact, and encrypted authentication tokens. We never store raw credit card numbers on our servers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                2. Google Ads & Enhanced Conversions
              </h2>
              <p>
                Our storefront implements secure SHA-256 client-side hashing prior to transmitting conversion metrics to Google Tag Manager and GA4. Your raw personal identifiers are never exposed or transmitted in cleartext.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                3. Client Rights & Account Erasure
              </h2>
              <p>
                In strict accordance with the Saudi PDPL, you retain the right to review, update, or permanently delete your account and personal records at any time directly through your Atelier Account settings.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
