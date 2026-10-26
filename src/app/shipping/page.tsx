'use client';

import React, { useEffect, useState } from 'react';
import { Truck, ShieldCheck, Clock, PackageCheck, Sparkles } from 'lucide-react';
import { deliveryService } from '@/api/delivery';
import { DeliveryMethod } from '@/types/api';
import { useThemeStore } from '@/store/useThemeStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export default function ShippingPage() {
  const { language, formatPrice } = useThemeStore();
  const { settings } = useSiteSettingsStore();
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);

  useEffect(() => {
    deliveryService.getDeliveryMethods().then(setMethods).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <div className="space-y-3">
        <ShimmerBadge icon={<Truck className="w-3.5 h-3.5" />}>
          White-Glove Courier
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {language === 'ar' ? 'الشحن والتوصيل الفاخر' : 'Luxury Shipping & Delivery Guide'}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          {language === 'ar' ? 'توصيل سريع لباب البيت لكافة محافظات مصر (القاهرة، الجيزة، الإسكندرية والدلتا والصعيد)' : 'Express door-to-door delivery across all Egyptian governorates'}
        </p>
      </div>

      {/* Dynamic Shipping Policy Statement if provided */}
      {settings.shippingPolicy && (
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] font-light whitespace-pre-line">
          <h2 className="font-serif text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[var(--accent-gold)]" />
            <span>{language === 'ar' ? 'سياسة الشحن ومواعيد التسليم المعتمدة' : 'Official Delivery & Dispatch Policy'}</span>
          </h2>
          <p>{settings.shippingPolicy}</p>
        </div>
      )}

      {/* Methods fetched live from backend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
                {m.shortName}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{m.description}</p>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-medium">{m.deliveryTime}</span>
              <span className="font-bold text-[var(--accent-gold)] font-serif text-sm">
                {m.cost === 0 ? 'FREE' : formatPrice(m.cost)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Signature Packaging */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 text-xs leading-relaxed text-[var(--text-secondary)] font-light">
        <h2 className="font-serif text-xl font-light text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--accent-gold)]" />
          <span>Signature Atelier Packaging</span>
        </h2>
        <p>
          Every commissioned abaya is hand-steamed, wrapped in acid-free archival tissue paper, and placed within a bespoke gold-embossed keepsake presentation box accompanied by a custom breathable garment travel bag and wooden hanger.
        </p>
      </div>
    </div>
  );
}
