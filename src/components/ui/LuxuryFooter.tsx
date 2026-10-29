'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useThemeStore } from '@/store/useThemeStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { translations } from '@/utils/translations';
import {
  Mail,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Check,
  MapPin,
  Phone,
  Globe,
  Share2,
} from 'lucide-react';
import SocialMediaLinks from '@/components/ui/SocialIcons';

export default function LuxuryFooter() {
  const { language } = useThemeStore();
  const { settings } = useSiteSettingsStore();
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const whatsappNumber = settings.whatsappNumber || process.env.NEXT_PUBLIC_CONCIERGE_WHATSAPP || '+201096212029';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    language === 'ar'
      ? `مرحباً، أود الاستفسار عن تفصيل عباية فاخرة من ${settings.storeName || 'دار الأناقة'}.`
      : `Hello, I would like to inquire about a bespoke couture Abaya order from ${settings.storeName || "L'Élégance Atelier"}.`
  )}`;

  const brandDisplayName = mounted && settings.storeName ? settings.storeName : (settings.storeName || t.brandName);
  const brandDisplayAbout =
    settings.aboutUs ||
    (language === 'ar'
      ? 'دار كوتور مصرية شرقية متخصصة في ابتكار أزياء الهوت كوتور والعبايات الملكية من أرقى الحراير اليابانية والإيطالية المطرّزة بأيدي نخبة من الخياطين.'
      : 'A bespoke Egyptian haute-couture atelier dedicated to oriental luxury. Master couturiers weaving Japanese silks and hand-finished metallic embroidery.');
  const displayAddress = settings.address || (language === 'ar' ? 'أبو كبير - الشرقية، مصر' : 'Abu Kabir - Sharqia, Egypt');

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] mt-24">
      {/* Contact Us Bar */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2 flex-wrap">
                <span>{language === 'ar' ? 'فريق خدمة العملاء جاهز للإجابة على كافة استفساراتكم' : 'Our customer care team is available for all inquiries'}</span>
                <span className="hidden sm:inline text-[var(--accent-gold)]">•</span>
                <span dir="ltr" className="font-mono font-medium text-[var(--accent-gold)]">{whatsappNumber}</span>
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent-gold)] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[var(--accent-bronze)] hover:text-white transition-all shadow-md"
          >
            <span>{language === 'ar' ? 'صفحة تواصل معنا' : 'Contact Us'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Editorial Info */}
          <div className="lg:col-span-2">
            <span className="block font-serif text-2xl sm:text-3xl tracking-[0.15em] font-light text-[var(--text-primary)] mb-1">
              {brandDisplayName}
            </span>
            <span className="block text-[10px] tracking-[0.35em] uppercase text-[var(--accent-gold)] mb-4 font-semibold">
              {t.brandSubtitle}
            </span>
            <p className="text-sm leading-relaxed max-w-sm mb-6 text-[var(--text-secondary)] line-clamp-4">
              {brandDisplayAbout}
            </p>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                <span>{displayAddress}</span>
              </div>
              {settings.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-[var(--accent-gold)] transition-colors">
                    {settings.contactEmail}
                  </a>
                </div>
              )}
              {settings.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                  <a href={`tel:${settings.contactPhone}`} dir="ltr" className="hover:text-[var(--accent-gold)] transition-colors font-mono">
                    {settings.contactPhone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'سجل تجاري مصري موثق وخاضع لرقابة جهاز حماية المستهلك'
                    : 'Certified Egyptian Commercial Registration & Authentic Silks'}
                </span>
              </div>
            </div>

            {/* Social Links Row */}
            <SocialMediaLinks includeWhatsApp={true} />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[var(--text-primary)] font-semibold mb-4">
              {language === 'ar' ? 'المجموعات' : 'Collections'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/shop" className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'جميع العبايات' : 'All Couture Abayas'}
                </Link>
              </li>
              <li>
                <Link href={`/shop?color=${encodeURIComponent('أسود ملكي')}`} className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'الأسود الملكي' : 'Royal Midnight Black'}
                </Link>
              </li>
              <li>
                <Link href={`/shop?color=${encodeURIComponent('بيج رملي')}`} className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'بيج فاخر' : 'Desert Sand Beige'}
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'المفضلة' : 'Wishlist'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Care & Legal */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[var(--text-primary)] font-semibold mb-4">
              {language === 'ar' ? 'خدمة العملاء والسياسات' : 'Client Services'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/orders" className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'متابعة سجل طلباتي' : 'Track My Orders'}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'الشحن والتوصيل' : 'Shipping & White-Glove'}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'الاستبدال والاسترجاع' : 'Returns & Inspection'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy (PDPL)'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--accent-gold)] transition-colors">
                  {language === 'ar' ? 'تواصل معنا' : 'Contact & Locations'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Private Circle */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[var(--text-primary)] font-semibold mb-4">
              {language === 'ar' ? 'النشرة الحصرية' : 'The Private Circle'}
            </h3>
            <p className="text-xs leading-relaxed mb-4 text-[var(--text-secondary)]">
              {language === 'ar'
                ? 'اشتركي لتصلكِ معاينات المجموعات الملكية والتفاصيل الخاصة قبل الطرح العام.'
                : 'Subscribe to receive private invitations to runway previews and limited releases.'}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] text-xs font-semibold">
                <Check className="w-4 h-4" />
                <span>{language === 'ar' ? 'تم اشتراككِ بنجاح في الدائرة الخاصة' : 'Welcome to the Private Circle'}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label={language === 'ar' ? 'البريد الإلكتروني للنشرة الحصرية' : 'Email address for newsletter'}
                    placeholder={language === 'ar' ? 'بريدكِ الإلكتروني...' : 'Enter your email...'}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label={language === 'ar' ? 'اشتراك في النشرة الحصرية' : 'Subscribe to newsletter'}
                    className="absolute right-1 top-1 bottom-1 min-w-[36px] px-3 bg-[var(--accent-gold)] text-black rounded-lg text-xs font-bold hover:bg-[var(--accent-bronze)] hover:text-white transition-colors flex items-center justify-center"
                  >
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom row: Dynamic Copyright */}
        <div className="mt-16 pt-8 border-t border-[var(--border-subtle)] flex items-center justify-center text-center text-xs text-[var(--text-secondary)]">
          <p>© {new Date().getFullYear()} {brandDisplayName}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
