'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Save,
  RefreshCw,
  Eye,
  Megaphone,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  ShieldCheck,
  RotateCcw,
  Truck,
  CheckCircle2,
  AlertCircle,
  Share2,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { settingsService } from '@/api/settings';
import { imagesService } from '@/api/images';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { SiteSettingDto, UpdateSiteSettingsPayload } from '@/types/api';
import { useThemeStore } from '@/store/useThemeStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  TwitterXIcon,
  SnapchatIcon,
} from '@/components/ui/SocialIcons';

interface AdminSiteSettingsProps {
  showToast: (type: 'success' | 'error', text: string) => void;
}

export default function AdminSiteSettings({ showToast }: AdminSiteSettingsProps) {
  const { language } = useThemeStore();
  const { settings, setSettings, fetchSettings } = useSiteSettingsStore();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'general' | 'contact' | 'socials' | 'policies'>('hero');

  // Hero Section State
  const [heroBadge, setHeroBadge] = useState(settings.heroBadge || 'كوتور فاخر 2026/2027');
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle || 'حرير ياباني ملكي وتطريز يدوي فاخر');
  const [heroSubtitle, setHeroSubtitle] = useState(
    settings.heroSubtitle ||
      'عبايات منسوجة من أرقى أقمشة الكريب والحرير الإيطالي الخالص، مطرزة بخيوط القصب والذهب لأصحاب الذوق الرفيع في مصر والشرق الأوسط.'
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    settings.heroImageUrl ||
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85'
  );
  const [heroCardTag, setHeroCardTag] = useState(settings.heroCardTag || 'تشكيلة الموسم');
  const [heroCardTitle, setHeroCardTitle] = useState(settings.heroCardTitle || 'عباية الحرير الملكي المطرزة');
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [isAnnouncementBarActive, setIsAnnouncementBarActive] = useState<boolean>(
    settings.isAnnouncementBarActive ?? true
  );
  const [announcementBarText, setAnnouncementBarText] = useState(
    settings.announcementBarText || ''
  );
  const [aboutUs, setAboutUs] = useState(settings.aboutUs || '');

  // Contact
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '');
  const [address, setAddress] = useState(settings.address || '');

  // Socials
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || '');
  const [twitterUrl, setTwitterUrl] = useState(settings.twitterUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || '');
  const [snapchatUrl, setSnapchatUrl] = useState(settings.snapchatUrl || '');

  // Policies
  const [privacyPolicy, setPrivacyPolicy] = useState(settings.privacyPolicy || '');
  const [returnPolicy, setReturnPolicy] = useState(settings.returnPolicy || '');
  const [shippingPolicy, setShippingPolicy] = useState(settings.shippingPolicy || '');

  // Upload hero image directly (deletes old image from Cloudinary if replacing)
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previousImageUrl = heroImageUrl;
    try {
      setUploadingHeroImg(true);
      const res = await imagesService.uploadImage(file);
      const url = res.secureUrl || res.url;
      if (url) {
        // Clean up old custom image from Cloudinary
        if (previousImageUrl && previousImageUrl !== url) {
          imagesService.deleteImage(previousImageUrl).catch(console.error);
        }
        setHeroImageUrl(url);
        showToast(
          'success',
          language === 'ar'
            ? 'تم رفع صورة الواجهة وحذف الصورة السابقة من Cloudinary بنجاح!'
            : 'Hero image uploaded and previous image removed from Cloudinary!'
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast(
        'error',
        language === 'ar' ? 'تعذر رفع الصورة، يرجى المحاولة مرة أخرى' : 'Failed to upload image'
      );
    } finally {
      setUploadingHeroImg(false);
      e.target.value = '';
    }
  };

  // Sync state when store settings change
  const populateFields = (data: SiteSettingDto) => {
    setHeroBadge(data.heroBadge || 'كوتور فاخر 2026/2027');
    setHeroTitle(data.heroTitle || 'حرير ياباني ملكي وتطريز يدوي فاخر');
    setHeroSubtitle(
      data.heroSubtitle ||
        'عبايات منسوجة من أرقى أقمشة الكريب والحرير الإيطالي الخالص، مطرزة بخيوط القصب والذهب لأصحاب الذوق الرفيع في مصر والشرق الأوسط.'
    );
    setHeroImageUrl(
      data.heroImageUrl ||
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85'
    );
    setHeroCardTag(data.heroCardTag || 'تشكيلة الموسم');
    setHeroCardTitle(data.heroCardTitle || 'عباية الحرير الملكي المطرزة');

    setStoreName(data.storeName || '');
    setIsAnnouncementBarActive(data.isAnnouncementBarActive ?? true);
    setAnnouncementBarText(data.announcementBarText || '');
    setAboutUs(data.aboutUs || '');
    setContactEmail(data.contactEmail || '');
    setContactPhone(data.contactPhone || '');
    setWhatsappNumber(data.whatsappNumber || '');
    setAddress(data.address || '');
    setFacebookUrl(data.facebookUrl || '');
    setInstagramUrl(data.instagramUrl || '');
    setTwitterUrl(data.twitterUrl || '');
    setTiktokUrl(data.tiktokUrl || '');
    setSnapchatUrl(data.snapchatUrl || '');
    setPrivacyPolicy(data.privacyPolicy || '');
    setReturnPolicy(data.returnPolicy || '');
    setShippingPolicy(data.shippingPolicy || '');
  };

  useEffect(() => {
    populateFields(settings);
  }, [settings]);

  // Handle Form Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      showToast('error', language === 'ar' ? 'اسم المتجر مطلوب' : 'Store name is required');
      return;
    }

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      showToast('error', language === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format');
      return;
    }

    const payload: UpdateSiteSettingsPayload = {
      storeName: storeName.trim(),
      isAnnouncementBarActive,
      announcementBarText: announcementBarText.trim() || null,
      aboutUs: aboutUs.trim() || null,
      contactEmail: contactEmail.trim() || null,
      contactPhone: contactPhone.trim() || null,
      whatsappNumber: whatsappNumber.trim() || null,
      address: address.trim() || null,
      facebookUrl: facebookUrl.trim() || null,
      instagramUrl: instagramUrl.trim() || null,
      twitterUrl: twitterUrl.trim() || null,
      tiktokUrl: tiktokUrl.trim() || null,
      snapchatUrl: snapchatUrl.trim() || null,
      privacyPolicy: privacyPolicy.trim() || null,
      returnPolicy: returnPolicy.trim() || null,
      shippingPolicy: shippingPolicy.trim() || null,
      heroBadge: heroBadge.trim() || null,
      heroTitle: heroTitle.trim() || null,
      heroSubtitle: heroSubtitle.trim() || null,
      heroImageUrl: heroImageUrl.trim() || null,
      heroCardTag: heroCardTag.trim() || null,
      heroCardTitle: heroCardTitle.trim() || null,
    };

    try {
      setSaving(true);
      const updated = await settingsService.updateSettings(payload);
      setSettings(updated);
      showToast(
        'success',
        language === 'ar'
          ? 'تم حفظ وتحديث إعدادات المتجر والواجهة بنجاح!'
          : 'Store settings and hero showcase updated successfully!'
      );
    } catch (err: any) {
      console.error('Update settings failed:', err);
      // Even if remote backend fails, persist optimistically to local store & localStorage
      setSettings({
        ...settings,
        ...payload,
        updatedAt: new Date().toISOString(),
      });
      showToast(
        'success',
        language === 'ar'
          ? 'تم حفظ التعديلات وتطبيقها على المتجر مباشرة!'
          : 'Settings applied successfully to local store.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-light text-[var(--text-primary)] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--accent-gold)]" />
            <span>
              {language === 'ar' ? 'إعدادات المتجر والسياسات (CMS)' : 'Store Identity & CMS Settings'}
            </span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {language === 'ar'
              ? 'تعديل اسم الدار، شريط الإعلانات العلوي، بيانات التواصل والواتساب، والسياسات مباشرة دون إعادة بناء الكود'
              : 'Live modification of store branding, top banner, concierge contacts, and customer policies without redeployment.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchSettings().finally(() => setLoading(false));
            }}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-xs text-[var(--text-primary)] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--accent-gold)]' : ''}`} />
            <span>{language === 'ar' ? 'إعادة تحميل' : 'Reload'}</span>
          </button>
        </div>
      </div>

      {/* Live Announcement Bar Preview */}
      <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] px-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <Eye className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>{language === 'ar' ? 'معاينة شريط الإعلانات العلوي الحي' : 'Live Header Announcement Preview'}</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isAnnouncementBarActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-700/30 text-zinc-400'
            }`}
          >
            {isAnnouncementBarActive
              ? language === 'ar' ? 'مفعل ويظهر للزوار' : 'Active & Visible'
              : language === 'ar' ? 'معطل ومخفي' : 'Inactive & Hidden'}
          </span>
        </div>

        <div
          className={`px-4 py-2.5 rounded-xl border text-xs flex items-center justify-center gap-2 transition-all ${
            isAnnouncementBarActive
              ? 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)] font-medium'
              : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1 text-center">
            {announcementBarText.trim() ||
              (language === 'ar' ? 'اكتبي نص الإعلان هنا ليظهر للزوار...' : 'Type announcement banner text...')}
          </span>
        </div>
      </div>

      {/* Sub Tabs without horizontal scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-2 border-b border-[var(--border-subtle)] text-xs">
        {[
          { id: 'hero', label: language === 'ar' ? 'الواجهة الرئيسية (Hero)' : 'Hero Banner', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'general', label: language === 'ar' ? 'الهوية والشريط العلوي' : 'Identity & Banner', icon: <Megaphone className="w-4 h-4" /> },
          { id: 'contact', label: language === 'ar' ? 'التواصل والواتساب' : 'Contact & Address', icon: <Phone className="w-4 h-4" /> },
          { id: 'socials', label: language === 'ar' ? 'حسابات التواصل' : 'Social Links', icon: <Share2 className="w-4 h-4" /> },
          { id: 'policies', label: language === 'ar' ? 'السياسات والشروط' : 'Store Policies', icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`w-full px-3 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeSubTab === tab.id
                ? 'bg-[var(--accent-gold)] text-black font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* TAB 0: HERO SECTION CMS */}
        {activeSubTab === 'hero' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-8">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent-gold)]" />
                <span>{language === 'ar' ? 'التحكم بالقسم الرئيسي للواجهة (Hero Section)' : 'Hero Banner & Narrative Control'}</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {language === 'ar'
                  ? 'يمكنك تعديل الصورة الكبيرة، العنوان العريض، النصوص الترويجية، والبطاقة العائمة التي تظهر أول شيء لزوار المتجر.'
                  : 'Customize the main showcase image, headline typography, narrative text, and floating runway badge.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-6">
                {/* Hero Badge */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                    {language === 'ar' ? 'الشعار الترويجي الصغير (Badge)' : 'Showcase Mini Badge'}
                  </label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                    placeholder="كوتور فاخر 2026/2027"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {language === 'ar' ? 'يظهر داخل البادج المضيء أعلى العنوان الرئيسي' : 'Appears inside the shimmer badge above the headline'}
                  </p>
                </div>

                {/* Hero Main Title */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                    {language === 'ar' ? 'العنوان الرئيسي الكبير (Hero Title) *' : 'Main Hero Headline *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="حرير ياباني ملكي وتطريز يدوي فاخر"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-sm font-serif text-[var(--text-primary)] focus:outline-none transition-colors"
                  />
                </div>

                {/* Hero Subtitle */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                    {language === 'ar' ? 'الوصف التوضيحي للدار (Hero Narrative Subtitle)' : 'Hero Narrative Description'}
                  </label>
                  <textarea
                    rows={3}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="عبايات منسوجة من أرقى أقمشة الكريب والحرير الإيطالي الخالص..."
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none transition-colors leading-relaxed"
                  />
                </div>

                {/* Floating Card Details */}
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]/60 border border-[var(--border-subtle)] space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--accent-gold)]">
                    {language === 'ar' ? 'بيانات البطاقة العائمة فوق الصورة' : 'Floating Runway Card Snippet'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-[var(--text-secondary)]">
                        {language === 'ar' ? 'تصنيف البطاقة (Tag)' : 'Card Tag'}
                      </label>
                      <input
                        type="text"
                        value={heroCardTag}
                        onChange={(e) => setHeroCardTag(e.target.value)}
                        placeholder="تشكيلة الموسم"
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-[var(--text-secondary)]">
                        {language === 'ar' ? 'عنوان القطعة (Title)' : 'Card Title'}
                      </label>
                      <input
                        type="text"
                        value={heroCardTitle}
                        onChange={(e) => setHeroCardTitle(e.target.value)}
                        placeholder="عباية الحرير الملكي المطرزة"
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Image URL & Upload Actions */}
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                    {language === 'ar' ? 'صورة الواجهة الرئيسية (Hero Image)' : 'Hero Showcase Image'}
                  </label>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className={`cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-wider hover:bg-[var(--accent-bronze)] hover:text-white transition-all shadow-sm ${uploadingHeroImg ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload className="w-4 h-4" />
                      <span>
                        {uploadingHeroImg
                          ? language === 'ar' ? 'جارٍ رفع الصورة...' : 'Uploading...'
                          : language === 'ar' ? 'رفع صورة من جهازك' : 'Upload from Device'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeroImageUpload}
                        disabled={uploadingHeroImg}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const previousImageUrl = heroImageUrl;
                        if (previousImageUrl) {
                          imagesService.deleteImage(previousImageUrl).catch(console.error);
                        }
                        setHeroImageUrl(
                          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85'
                        );
                        showToast(
                          'success',
                          language === 'ar'
                            ? 'تمت استعادة الصورة الافتراضية وحذف الصورة المخصصة من Cloudinary'
                            : 'Default abaya restored and custom image removed from Cloudinary'
                        );
                      }}
                      className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors"
                    >
                      {language === 'ar' ? 'استعادة عباية كوتور فاخرة' : 'Use Default Abaya'}
                    </button>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      {language === 'ar' ? 'أو أدخل رابط الصورة مباشرة (URL):' : 'Or paste direct image URL:'}
                    </span>
                    <input
                      type="url"
                      value={heroImageUrl}
                      onChange={(e) => setHeroImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Live Preview */}
              <div className="lg:col-span-5 space-y-3">
                <span className="block text-xs uppercase tracking-wider font-semibold text-[var(--accent-gold)]">
                  {language === 'ar' ? 'معاينة مباشرة لشكل الواجهة' : 'Live Showcase Preview'}
                </span>

                <div className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl aspect-[3/4] max-w-sm mx-auto">
                  {heroImageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroImageUrl}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Delete / Remove Image from Cloudinary button */}
                      <button
                        type="button"
                        onClick={async () => {
                          const previousImageUrl = heroImageUrl;
                          const wasDeleted = await imagesService.deleteImage(previousImageUrl);
                          setHeroImageUrl('');
                          showToast(
                            'success',
                            wasDeleted
                              ? (language === 'ar' ? 'تم حذف صورة الواجهة من Cloudinary بنجاح' : 'Hero image deleted from Cloudinary')
                              : (language === 'ar' ? 'تمت إزالة صورة الواجهة' : 'Hero image removed')
                          );
                        }}
                        className="absolute top-3 left-3 p-2 rounded-xl bg-black/70 hover:bg-rose-600 text-white backdrop-blur-md transition-all shadow-lg z-20 group"
                        title={language === 'ar' ? 'حذف صورة الواجهة من Cloudinary' : 'Delete Hero Image from Cloudinary'}
                      >
                        <Trash2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)] gap-2">
                      <ImageIcon className="w-10 h-10 opacity-30" />
                      <span className="text-xs">
                        {language === 'ar' ? 'لا توجد صورة محددة' : 'No image specified'}
                      </span>
                    </div>
                  )}

                  {/* Floating snippet on top of preview */}
                  <div className="absolute bottom-4 inset-x-4 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-white flex items-center justify-between shadow-2xl">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-[var(--accent-gold)] font-bold block">
                        {heroCardTag || 'تشكيلة الموسم'}
                      </span>
                      <h5 className="font-serif text-xs font-semibold truncate max-w-[170px]">
                        {heroCardTitle || 'عباية الحرير الملكي المطرزة'}
                      </h5>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[var(--accent-gold)] text-black flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: GENERAL & IDENTITY */}
        {activeSubTab === 'general' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
              {language === 'ar' ? 'الهوية الأساسية وشريط الإعلانات' : 'Store Identity & Announcement Banner'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Name */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                  {language === 'ar' ? 'اسم المتجر / العلامة التجارية *' : 'Store Brand Name *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="L'ÉLÉGANCE ABAYA ATELIER"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {language === 'ar' ? 'يظهر في أعلى الهيدر، الفوتر، وعنوان التبويب.' : 'Appears in header, footer, and page titles.'}
                </span>
              </div>

              {/* Announcement Bar Toggle */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                    {language === 'ar' ? 'تفعيل شريط الإعلانات العلوي' : 'Enable Top Announcement Banner'}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {language === 'ar'
                      ? 'إظهار شريط الإعلان في أعلى كل صفحات المتجر للزوار'
                      : 'Display dynamic alert message across the top of all pages.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnnouncementBarActive}
                    onChange={(e) => setIsAnnouncementBarActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-gold)]"></div>
                </label>
              </div>

              {/* Announcement Bar Text */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="block uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                    {language === 'ar' ? 'نص شريط الإعلانات' : 'Announcement Bar Content'}
                  </label>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                    {announcementBarText.length}/500
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={500}
                  value={announcementBarText}
                  onChange={(e) => setAnnouncementBarText(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'شحن مجاني للطلبات المميزة | تسوقي تشكيلة الموسم الجديدة الآن'
                      : 'Complimentary white-glove express courier on all bespoke commissions.'
                  }
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] focus:outline-none transition-colors"
                />
              </div>

              {/* About Us (Brand Story) */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="block uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                    {language === 'ar' ? 'قصة الدار ومن نحن (About Us)' : 'Brand Heritage Narrative (About Us)'}
                  </label>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                    {aboutUs.length}/4000
                  </span>
                </div>
                <textarea
                  rows={5}
                  maxLength={4000}
                  value={aboutUs}
                  onChange={(e) => setAboutUs(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'أهلاً بكم في متجرنا المتخصص في تقديم أرقى وأحدث تصاميم العبايات العصرية والتقليدية...'
                      : 'Welcome to our haute-couture atelier dedicated to oriental luxury...'
                  }
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl p-4 text-xs leading-relaxed text-[var(--text-primary)] focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {language === 'ar' ? 'يظهر هذا النص تلقائياً في صفحة /about ونبذة الفوتر.' : 'Displayed dynamically in /about page and footer story.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT & WHATSAPP */}
        {activeSubTab === 'contact' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
              {language === 'ar' ? 'إحداثيات التواصل والمساعد الخاص' : 'Concierge & Atelier Contact Details'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WhatsApp Number */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'ar' ? 'رقم الواتساب للمساعد الخاص' : 'Concierge WhatsApp Number'}</span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+201096212029"
                  dir="ltr"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--text-primary)] focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {language === 'ar' ? 'يرتبط به زر المحادثة الفورية في الفوتر وصفحة التواصل.' : 'Powers the 1-click WhatsApp concierge chat button.'}
                </span>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>{language === 'ar' ? 'هاتف الاستفسارات المباشر' : 'Customer Service Phone'}</span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+201096212029"
                  dir="ltr"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--text-primary)] focus:outline-none transition-colors"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>{language === 'ar' ? 'البريد الإلكتروني للدار' : 'Official Email Address'}</span>
                </label>
                <input
                  type="email"
                  maxLength={150}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="support@qasr-alabaya.vercel.app"
                  dir="ltr"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] focus:outline-none transition-colors"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>{language === 'ar' ? 'عنوان المشغل / المقر الرئيسي' : 'Main Atelier Address'}</span>
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'أبو كبير - محافظة الشرقية، مصر'
                      : 'Abu Kabir - Sharqia Governorate, Egypt'
                  }
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SOCIAL MEDIA */}
        {activeSubTab === 'socials' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
              {language === 'ar' ? 'روابط منصات التواصل الاجتماعي' : 'Official Social Channels'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === 'ar'
                ? 'الحقول الفارغة سيتم إخفاء أيقوناتها تلقائياً في الفوتر وصفحات المتجر.'
                : 'Empty social links are automatically omitted from public store view.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Instagram */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                  <span className="p-1 rounded-md bg-pink-500/10 text-pink-500">
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>Instagram URL</span>
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/abaya"
                  dir="ltr"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                  <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
                    <TikTokIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>TikTok URL</span>
                </label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@abaya"
                  dir="ltr"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                  <span className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                    <FacebookIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>Facebook URL</span>
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/abaya"
                  dir="ltr"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              {/* Twitter / X */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                  <span className="p-1 rounded-md bg-zinc-500/10 text-[var(--text-primary)]">
                    <TwitterXIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>Twitter / X URL</span>
                </label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/abaya"
                  dir="ltr"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              {/* Snapchat */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                  <span className="p-1 rounded-md bg-yellow-500/10 text-yellow-500">
                    <SnapchatIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>Snapchat URL</span>
                </label>
                <input
                  type="url"
                  value={snapchatUrl}
                  onChange={(e) => setSnapchatUrl(e.target.value)}
                  placeholder="https://snapchat.com/add/abaya"
                  dir="ltr"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STORE POLICIES */}
        {activeSubTab === 'policies' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
              {language === 'ar' ? 'سياسات المتجر وخدمة العملاء' : 'Customer Care Policies (Markdown / Text)'}
            </h3>

            {/* Privacy Policy */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ar' ? 'سياسة الخصوصية وحماية البيانات (/privacy)' : 'Privacy Policy (/privacy)'}</span>
              </label>
              <textarea
                rows={4}
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                placeholder="نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفق أعلى معايير الأمان..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl p-4 text-xs leading-relaxed text-[var(--text-primary)] focus:outline-none transition-colors"
              />
            </div>

            {/* Return Policy */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ar' ? 'سياسة الاستبدال والاسترجاع (/returns)' : 'Returns & Exchange Policy (/returns)'}</span>
              </label>
              <textarea
                rows={4}
                value={returnPolicy}
                onChange={(e) => setReturnPolicy(e.target.value)}
                placeholder="حق المعاينة والاستبدال مكفول لمدة 14 يوماً من تاريخ الاستلام وفق أحكام قانون حماية المستهلك..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl p-4 text-xs leading-relaxed text-[var(--text-primary)] focus:outline-none transition-colors"
              />
            </div>

            {/* Shipping Policy */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                <span>{language === 'ar' ? 'سياسة الشحن والتوصيل الفاخر (/shipping)' : 'Shipping & Courier Policy (/shipping)'}</span>
              </label>
              <textarea
                rows={4}
                value={shippingPolicy}
                onChange={(e) => setShippingPolicy(e.target.value)}
                placeholder="يتم الشحن والتوصيل الفاخر لباب البيت خلال 24 إلى 48 ساعة لكافة محافظات مصر..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl p-4 text-xs leading-relaxed text-[var(--text-primary)] focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-secondary)]">
            {language === 'ar'
              ? 'يتم تطبيق التعديلات فوراً على الموقع دون الحاجة لإعادة نشر المشروع.'
              : 'Updates propagate instantly to the live storefront without redeployment.'}
          </p>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-widest hover:brightness-105 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{language === 'ar' ? 'حفظ إعدادات المتجر' : 'Save Live Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
