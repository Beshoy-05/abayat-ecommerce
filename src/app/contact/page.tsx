'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import ShimmerBadge from '@/components/ui/ShimmerBadge';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
  const { language } = useThemeStore();
  const { settings } = useSiteSettingsStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Bespoke Bridal Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const whatsappNumber = settings.whatsappNumber || process.env.NEXT_PUBLIC_CONCIERGE_WHATSAPP || '+201096212029';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    language === 'ar'
      ? 'مرحباً، أود حجز موعد استشارة لتفصيل عباية خاصة.'
      : 'Hello, I would like to schedule a private bespoke couture consultation.'
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      qEn: 'Can I request bespoke custom sizing for height and sleeve length?',
      qAr: 'هل يمكنني طلب تعديل خاص على طول العباية أو مقاس الأكمام؟',
      aEn: 'Yes, absolutely. Our master couturiers cater to custom proportions. Simply contact our customer support via WhatsApp with your exact measurements.',
      aAr: 'نعم بالتأكيد، يوفر مشغلنا خدمة التفصيل الخاص وتعديل أطوال العباية والأكمام بدقة متناهية عبر خدمة العملاء على واتساب.',
    },
    {
      qEn: 'Which courier services do you utilize for GCC deliveries?',
      qAr: 'ما هي شركات الشحن المعتمدة للتوصيل في السعودية والخليج؟',
      aEn: 'We dispatch via premium express white-glove partners ensuring signature door-to-door delivery within 24 to 48 hours.',
      aAr: 'يتم شحن جميع الطلبات عبر نخبة من أسرع شركات الشحن السريع مع التوصيل لباب البيت خلال 24 إلى 48 ساعة كحد أقصى.',
    },
    {
      qEn: 'What fabrics are used in L\'Élégance garments?',
      qAr: 'ما هي أنواع الأقمشة المستخدمة في عبايات دار الأناقة؟',
      aEn: 'We exclusively work with heavyweight Japanese raw crepes, pure Italian silks, organza, and authentic French Chantilly lace.',
      aAr: 'نستخدم حصرياً أرقى أنواع الكريب الياباني الملكي، الحرير الإيطالي الخالص، وخيوط القصب المذهبة مع الدانتيل الفرنسي.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-20">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <ShimmerBadge icon={<Sparkles className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-[var(--text-primary)]">
          {language === 'ar' ? 'تواصل مع دار الأناقة' : 'Connect with the Atelier'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed">
          {language === 'ar'
            ? 'فريق خدمة العملاء واستشارات الأزياء في خدمتكم على مدار الساعة'
            : 'Our dedicated customer care team and stylists are at your service for all inquiries.'}
        </p>
      </div>

      {/* Main Grid: Contact Card + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Information */}
        <div className="lg:col-span-5 space-y-6">
          {/* WhatsApp Feature Card */}
          <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                {language === 'ar' ? 'خدمة العملاء عبر واتساب' : 'Customer Care via WhatsApp'}
              </h3>
              <p className="text-sm font-mono text-[var(--accent-gold)] mt-1 font-semibold tracking-wider" dir="ltr">
                {whatsappNumber}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'محادثة مباشرة مع فريق خدمة العملاء لاختيار القماش والمقاس والمساعدة في الطلب.'
                  : 'Direct, instant messaging with our customer support team for custom orders and measurement guidance.'}
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent-bronze)] hover:text-white transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>{language === 'ar' ? 'تواصل عبر واتساب' : 'Chat via WhatsApp'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </a>
          </div>

          {/* Showroom Locations */}
          <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-sm text-xs text-[var(--text-secondary)]">
            <h4 className="font-serif text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>{language === 'ar' ? 'عنوان المشغل وصالات الاستقبال' : 'Atelier & Salons'}</span>
            </h4>
            <div className="space-y-3 pt-2">
              <div>
                <strong className="text-[var(--text-primary)] block font-semibold text-sm">
                  {language === 'ar' ? 'المقر الرئيسي والمشغل:' : 'Main Atelier & Headquarters:'}
                </strong>
                <span className="text-[var(--accent-gold)] font-medium">
                  {settings.address || (language === 'ar' ? 'أبو كبير - محافظة الشرقية، مصر' : 'Abu Kabir - Sharqia Governorate, Egypt')}
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)]/40">
                <strong className="text-[var(--text-primary)] block font-semibold">
                  {language === 'ar' ? 'هاتف وواتساب الاستفسارات المباشر:' : 'Direct Phone & WhatsApp:'}
                </strong>
                <span dir="ltr" className="font-mono text-[var(--text-primary)] font-medium">
                  {settings.contactPhone || whatsappNumber}
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)]/40">
                <strong className="text-[var(--text-primary)] block font-semibold">
                  {language === 'ar' ? 'ساعات استقبال الطلبات والتفصيل:' : 'Service Hours:'}
                </strong>
                <span>
                  {language === 'ar' ? 'يومياً من الساعة 10:00 صباحاً حتى 10:00 مساءً' : 'Daily from 10:00 AM to 10:00 PM'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bespoke Inquiry Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-xl">
          <h3 className="font-serif text-2xl font-light text-[var(--text-primary)]">
            {language === 'ar' ? 'طلب استشارة أو تفصيل خاص' : 'Inquire for Bespoke Commissions'}
          </h3>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2 text-center">
              <Check className="w-8 h-8 mx-auto" />
              <h4 className="font-serif text-lg font-semibold">
                {language === 'ar' ? 'تم استلام استفساركِ بنجاح' : 'Inquiry Received'}
              </h4>
              <p className="text-xs">
                {language === 'ar'
                  ? 'سيتواصل معكِ فريق خدمة العملاء خلال ساعتي عمل.'
                  : 'Our customer care team will connect with you within 2 business hours.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                    {language === 'ar' ? 'الاسم الكريم *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: نورة الدوسري' : 'e.g. Noura Al-Dosari'}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="noura@example.com"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                  {language === 'ar' ? 'موضوع الاستفسار' : 'Inquiry Topic'}
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Bespoke Bridal Inquiry">
                    {language === 'ar' ? 'تفصيل عباية زفاف ومناسبات ملكية' : 'Royal Bridal Abaya Commission'}
                  </option>
                  <option value="Custom Sizing">
                    {language === 'ar' ? 'تعديل خاص على المقاسات والأكمام' : 'Bespoke Height & Sleeve Tailoring'}
                  </option>
                  <option value="Order Tracking Support">
                    {language === 'ar' ? 'متابعة حالة شحن وتوصيل طلب' : 'Express Courier Tracking Status'}
                  </option>
                  <option value="Private Salon Appointment">
                    {language === 'ar' ? 'حجز موعد استشارة وتفصيل خاص' : 'Private Salon Appointment Booking'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                  {language === 'ar' ? 'تفاصيل الطلب أو المقاسات المطلوبة *' : 'Your Requirements & Sizing Details *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'أخبرينا عن موعد المناسبة، نوع القماش المفضل، أو المقاسات الخاصة...'
                      : 'Tell us about the occasion date, preferred fabric, or custom measurements...'
                  }
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl p-3.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:brightness-105 transition-all"
              >
                {language === 'ar' ? 'إرسال الاستفسار' : 'Send Bespoke Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Accordion FAQ */}
      <div className="max-w-3xl mx-auto space-y-6 pt-10 border-t border-[var(--border-subtle)]">
        <div className="text-center space-y-2">
          <h3 className="font-serif text-2xl font-light text-[var(--text-primary)]">
            {language === 'ar' ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'}
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface)] overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left rtl:text-right flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors"
              >
                <span>{language === 'ar' ? faq.qAr : faq.qEn}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeFaq === idx ? 'rotate-180 text-[var(--accent-gold)]' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5 text-xs text-[var(--text-secondary)] leading-relaxed font-light border-t border-[var(--border-subtle)]/40 pt-3"
                  >
                    {language === 'ar' ? faq.aAr : faq.aEn}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
