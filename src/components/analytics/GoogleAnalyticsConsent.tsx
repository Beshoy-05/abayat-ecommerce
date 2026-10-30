'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ShieldCheck } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import {
  ConsentStatus,
  clearPendingAnalyticsQueue,
  getAnalyticsConsent,
  markGoogleAnalyticsReady,
  pushGtagConsent,
  setAnalyticsConsent,
} from '@/utils/analytics';

interface GoogleAnalyticsConsentProps {
  gaId?: string;
}

function subscribeConsent(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onStoreChange();
  window.addEventListener('abaya:consent-updated', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('abaya:consent-updated', handler);
    window.removeEventListener('storage', handler);
  };
}

function getServerConsentSnapshot(): ConsentStatus {
  return 'undecided';
}

function subscribeDebugMode(): () => void {
  return () => {};
}

function getClientDebugSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_GA_DEBUG === 'true' ||
    searchParams.get('ga_debug') === '1'
  );
}

function getServerDebugSnapshot(): boolean {
  return false;
}

export default function GoogleAnalyticsConsent({ gaId }: GoogleAnalyticsConsentProps) {
  const normalizedGaId = gaId?.trim();
  const pathname = usePathname();
  const language = useThemeStore((s) => s.language);

  const consent = useSyncExternalStore(
    subscribeConsent,
    getAnalyticsConsent,
    getServerConsentSnapshot
  );
  const isDebugMode = useSyncExternalStore(
    subscribeDebugMode,
    getClientDebugSnapshot,
    getServerDebugSnapshot
  );

  const [bannerVisible, setBannerVisible] = useState(false);

  // Show non-blocking consent banner when undecided, and listen for manual preference dialog open
  useEffect(() => {
    if (!normalizedGaId) return;

    let bannerTimer: ReturnType<typeof setTimeout> | null = null;
    if (consent === 'undecided') {
      bannerTimer = setTimeout(() => {
        setBannerVisible(true);
      }, 1200);
    }

    const handleOpenPreferences = () => {
      setBannerVisible(true);
    };

    window.addEventListener('abaya:open-consent-preferences', handleOpenPreferences);

    return () => {
      if (bannerTimer) clearTimeout(bannerTimer);
      window.removeEventListener('abaya:open-consent-preferences', handleOpenPreferences);
    };
  }, [normalizedGaId, consent]);

  // Clear stale pre-consent buffered events when navigating across routes while still undecided
  useEffect(() => {
    if (consent === 'undecided') {
      clearPendingAnalyticsQueue();
    }
  }, [pathname, consent]);

  // When consent is explicitly granted, configure Consent Mode v2 and flush queued current-page events
  useEffect(() => {
    if (!normalizedGaId || consent !== 'granted') return;

    pushGtagConsent('default', true);

    const flushTimer = setTimeout(() => {
      markGoogleAnalyticsReady();
    }, 0);

    return () => clearTimeout(flushTimer);
  }, [normalizedGaId, consent]);

  const handleAccept = () => {
    setBannerVisible(false);
    setAnalyticsConsent('granted', normalizedGaId);
  };

  const handleDecline = () => {
    setBannerVisible(false);
    setAnalyticsConsent('denied', normalizedGaId);
  };

  if (!normalizedGaId) return null;

  return (
    <>
      {/* Load Google Analytics 4 (`gtag.js`) ONLY after explicit user consent */}
      {consent === 'granted' && <GoogleAnalytics gaId={normalizedGaId} debugMode={isDebugMode} />}

      {/* Non-blocking Privacy & Analytics Consent Banner */}
      {bannerVisible && (
        <aside
          aria-label={language === 'ar' ? 'إعدادات الخصوصية وملفات الارتباط' : 'Privacy and analytics preferences'}
          className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-5 sm:left-5 rtl:sm:left-auto rtl:sm:right-5 sm:max-w-sm z-40 p-4 rounded-2xl bg-[var(--bg-surface)]/95 lg:backdrop-blur-xl border border-[var(--border-subtle)] shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-gold)] shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="space-y-2.5 flex-1">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {language === 'ar' ? 'تفضيلات الخصوصية والتحليلات' : 'Privacy & Analytics Preferences'}
              </p>
              <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                {language === 'ar' ? (
                  <>
                    نستخدم تحليلات Google (GA4) لتحسين تجربة التسوق دون مشاركة أي بيانات شخصية. راجعي{' '}
                    <Link href="/privacy" className="text-[var(--accent-gold)] underline hover:opacity-80">
                      سياسة الخصوصية
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    We use Google Analytics (GA4) to improve your shopping experience without sharing personal data. Read our{' '}
                    <Link href="/privacy" className="text-[var(--accent-gold)] underline hover:opacity-80">
                      Privacy Policy
                    </Link>
                    .
                  </>
                )}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 min-h-[36px] px-3.5 py-2 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black text-[11px] font-bold uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'موافقة' : 'Accept'}
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  className="flex-1 min-h-[36px] px-3.5 py-2 rounded-full border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'الضرورية فقط' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
