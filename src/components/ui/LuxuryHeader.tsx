'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useThemeStore, CURRENCY_RATES } from '@/store/useThemeStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { translations } from '@/utils/translations';
import { CurrencyCode } from '@/types/api';
import { motion, AnimatePresence } from 'framer-motion';
import SocialMediaLinks from '@/components/ui/SocialIcons';

export default function LuxuryHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme, language, toggleLanguage, currency, setCurrency } = useThemeStore();
  const { getItemsCount, openCart } = useCartStore();
  const { wishlistIds } = useWishlistStore();
  const { isAuthenticated, isAdmin, loadFromStorage } = useAuthStore();
  const { settings, fetchSettings } = useSiteSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const t = translations[language];
  const cartCount = mounted ? getItemsCount() : 0;
  const wishlistCount = mounted ? wishlistIds.length : 0;
  const currentIsAdmin = mounted ? isAdmin : false;
  const currentIsAuthenticated = mounted ? isAuthenticated : false;

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
    fetchSettings();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadFromStorage, fetchSettings]);

  // Dynamic Browser Tab / Page Title based on Admin Store Name
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const storeTitle = (mounted && settings.storeName?.trim()) || settings.storeName?.trim() || t.brandName;

    if (pathname === '/') {
      document.title = storeTitle;
      return;
    }

    let pageLabel = '';
    if (pathname === '/shop') {
      pageLabel = language === 'ar' ? 'المجموعات' : 'Collections';
    } else if (pathname === '/about') {
      pageLabel = language === 'ar' ? 'عن الدار' : 'About Us';
    } else if (pathname === '/contact') {
      pageLabel = language === 'ar' ? 'تواصل معنا' : 'Contact Us';
    } else if (pathname.startsWith('/admin')) {
      pageLabel = language === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Dashboard';
    } else if (pathname === '/wishlist') {
      pageLabel = language === 'ar' ? 'المفضلة' : 'Wishlist';
    } else if (pathname === '/orders') {
      pageLabel = language === 'ar' ? 'الطلبات' : 'Orders';
    } else if (pathname === '/account') {
      pageLabel = language === 'ar' ? 'حسابي' : 'Account';
    } else if (pathname === '/login') {
      pageLabel = language === 'ar' ? 'تسجيل الدخول' : 'Sign In';
    } else if (pathname === '/register') {
      pageLabel = language === 'ar' ? 'إنشاء حساب جديد' : 'Register';
    } else if (pathname === '/cart') {
      pageLabel = language === 'ar' ? 'حقيبة التسوق' : 'Shopping Bag';
    } else if (pathname === '/checkout') {
      pageLabel = language === 'ar' ? 'إتمام الطلب' : 'Checkout';
    } else if (pathname === '/shipping') {
      pageLabel = language === 'ar' ? 'الشحن والتوصيل' : 'Shipping';
    } else if (pathname === '/returns') {
      pageLabel = language === 'ar' ? 'الاستبدال والاسترجاع' : 'Returns';
    } else if (pathname === '/terms') {
      pageLabel = language === 'ar' ? 'الشروط والأحكام' : 'Terms';
    } else if (pathname === '/privacy') {
      pageLabel = language === 'ar' ? 'سياسة الخصوصية' : 'Privacy';
    } else if (pathname.startsWith('/product/')) {
      if (document.title && document.title.includes('|') && !document.title.includes("L'ÉLÉGANCE")) {
        return;
      }
      pageLabel = language === 'ar' ? 'تفاصيل العباية' : 'Product Details';
    }

    if (pageLabel) {
      document.title = `${pageLabel} | ${storeTitle}`;
    } else {
      document.title = storeTitle;
    }
  }, [mounted, settings.storeName, pathname, language, t.brandName]);

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/shop', label: t.nav.shop },
    { href: `/shop?color=${encodeURIComponent('أسود ملكي')}`, label: t.nav.occasions },
    { href: '/about', label: t.nav.heritage },
    { href: '/contact', label: t.nav.contact },
  ];

  const activeAnnouncementText =
    settings.isAnnouncementBarActive && settings.announcementBarText
      ? settings.announcementBarText
      : language === 'ar'
      ? 'توصيل سريع مجاني لكافة محافظات مصر'
      : 'Complimentary Express Courier Across All Egypt';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'glass-nav shadow-lg py-3'
          : 'bg-[var(--bg-primary)] py-4 border-b border-[var(--border-subtle)]'
      }`}
    >
      {/* Top micro announcement bar */}
      <div className="hidden lg:block border-b border-[var(--border-subtle)] pb-2 mb-2 text-[11px] tracking-widest uppercase text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-hidden max-w-2xl">
            <Sparkles className="w-3 h-3 text-[var(--accent-gold)] shrink-0" />
            <span className="line-clamp-1">{activeAnnouncementText}</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1 font-semibold"
              >
                <span>{currency}</span>
                <span className="text-[9px]">▼</span>
              </button>

              <AnimatePresence>
                {isCurrencyDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-28 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-1 z-50"
                  >
                    {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => {
                          setCurrency(curr);
                          setIsCurrencyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent-gold)]/10 hover:text-[var(--accent-gold)] transition-colors flex justify-between ${
                          currency === curr ? 'text-[var(--accent-gold)] font-bold' : ''
                        }`}
                      >
                        <span>{curr}</span>
                        <span className="text-[var(--text-secondary)]">
                          {CURRENCY_RATES[curr].symbolAr}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1 font-semibold"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Day / Night Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>Day Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>Night Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & Nav links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wider uppercase font-medium transition-colors hover:text-[var(--accent-gold)] ${
                  pathname === link.href
                    ? 'text-[var(--accent-gold)] font-semibold border-b border-[var(--accent-gold)] pb-0.5'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Brand Identity */}
        <div className="text-center">
          <Link href="/" className="inline-block group">
            <span className="block text-2xl sm:text-3xl font-serif tracking-[0.2em] font-light text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
              {mounted && settings.storeName ? settings.storeName : t.brandName}
            </span>
            <span className="block text-[9px] tracking-[0.35em] uppercase text-[var(--accent-gold)] mt-0.5">
              {t.brandSubtitle}
            </span>
          </Link>
        </div>

        {/* Right: Actions (Search, Wishlist, User, Bag) */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Search Trigger */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-search-modal'));
              }
            }}
            className="p-2 text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors"
            aria-label="Search collection"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Icon with bouncy counter */}
          <Link
            href="/wishlist"
            className="relative p-2 text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors"
            aria-label="Saved favorites"
          >
            <Heart className="w-5 h-5" />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-[var(--accent-gold)] text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Account Profile / Login */}
          <Link
            href={currentIsAuthenticated ? '/account' : '/login'}
            className="p-2 text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors hidden sm:block"
            aria-label="Account"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Admin Dashboard CTA - Only for Admin */}
          {currentIsAuthenticated && currentIsAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--accent-gold)]/10 hover:bg-[var(--accent-gold)]/20 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-xs font-bold transition-all shadow-sm"
              title="لوحة تحكم الإدارة"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'الإدارة' : 'Admin'}</span>
            </Link>
          )}


          {/* Shopping Bag CTA */}
          <button
            onClick={openCart}
            className="relative p-2.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-all cursor-pointer shadow-sm group"
            aria-label="Open shopping bag"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-[var(--accent-gold)] text-black font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Slide-in Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ x: language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-4/5 max-w-sm h-full bg-[var(--bg-surface)] p-6 flex flex-col justify-between border-r border-[var(--border-subtle)]"
            >
              <div>
                <div className="flex justify-between items-center pb-6 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="font-serif text-xl tracking-wider text-[var(--text-primary)]">
                      {t.brandName}
                    </span>
                    <span className="block text-[8px] tracking-widest uppercase text-[var(--accent-gold)]">
                      {t.brandSubtitle}
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-8 flex flex-col gap-5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-serif hover:text-[var(--accent-gold)] transition-colors py-1"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href={currentIsAuthenticated ? '/account' : '/login'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-serif hover:text-[var(--accent-gold)] transition-colors py-1 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[var(--accent-gold)]" />
                    <span>{currentIsAuthenticated ? t.nav.account : t.nav.login}</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-serif hover:text-[var(--accent-gold)] transition-colors py-1"
                  >
                    {t.nav.orders}
                  </Link>
                  {currentIsAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-serif hover:text-[var(--accent-gold)] transition-colors py-1 flex items-center gap-2 text-[var(--accent-gold)] font-bold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Footer Toggles */}
              <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Language</span>
                  <button
                    onClick={toggleLanguage}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-semibold text-[var(--accent-gold)]"
                  >
                    {language === 'en' ? 'العربية' : 'English'}
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Theme</span>
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-semibold text-[var(--accent-gold)] flex items-center gap-1.5"
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    <span>{theme === 'dark' ? 'Day Mode' : 'Night Mode'}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Currency</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--accent-gold)] font-bold focus:outline-none"
                  >
                    {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-center">
                  <SocialMediaLinks className="flex items-center justify-center gap-3 pt-2" includeWhatsApp={true} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
