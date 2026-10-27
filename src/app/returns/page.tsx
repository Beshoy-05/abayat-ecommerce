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
        ) : language === 'ar' ? (
          <>
            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>حق المعاينة والاستبدال خلال 14 يوماً (وفق القانون المصري)</span>
              </h2>
              <p>
                امتثالاً لأحكام <strong>قانون حماية المستهلك المصري رقم 181 لسنة 2018</strong>، تضمن لكِ دار قصر العباية حق معاينة القطعة وقياسها في منزلك بكل راحة واطمئنان. في حال الرغبة في استبدال المقاس أو الاسترجاع، يحق لكِ طلب ذلك خلال 14 يوماً من تاريخ استلام الطلب من مندوب الشحن.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                شروط قبول الاستبدال والاسترجاع
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                  <span>أن تكون العباية بحالتها الأصلية غير ملبوسة، غير معدلة، وخالية من أي عطور أو آثار مساحيق تجميل.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                  <span>وجود كافة ملصقات وشارات الأمان الخاصة بدار قصر العباية مثبتة بالقطعة.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                  <span>إعادة العباية داخل علبة الحفظ الفاخرة وغلاف الكوتور الواقي المخصص.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                استلام المرتجع واسترداد الأموال
              </h2>
              <p>
                يكفي التواصل مع خدمة عملاء قصر العباية عبر واتساب على الرقم <strong dir="ltr">+20 10 96212029</strong>، وسيقوم مندوب الشحن بالحضور إلى باب بيتك لاستلام القطعة. يتم تحويل المبلغ فور استلام القطعة وفحصها عبر إنستاباي (InstaPay) أو محفظة فودافون كاش أو التحويل البنكي خلال 48 ساعة كحد أقصى.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>14-Day Home Fitting Guarantee (Egyptian Law #181/2018)</span>
              </h2>
              <p>
                In strict compliance with <strong>Egyptian Consumer Protection Law No. 181 of 2018</strong>, Qasr Al-Abaya guarantees your full right to inspect and fit your couture piece in the privacy of your home. If you wish to adjust sizing or initiate a return, you have a 14-day window from courier delivery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                Conditions for Return
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                  <span>Garment must remain unworn, unaltered, and free of perfumes or makeup marks.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                  <span>Original Qasr Al-Abaya luxury security tags must remain attached.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                  <span>Presentation box and travel garment bag must be returned in pristine condition.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-base font-semibold text-[var(--text-primary)]">
                Effortless Courier Pick-Up & Instant Refund
              </h2>
              <p>
                Simply message our VIP Concierge via WhatsApp at <strong dir="ltr">+20 10 96212029</strong>. A courier will collect the package from your doorstep. Refunds are issued via InstaPay, Vodafone Cash, or Card within 48 hours of quality inspection.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
