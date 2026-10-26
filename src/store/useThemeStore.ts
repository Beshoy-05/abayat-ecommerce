import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CurrencyCode } from '@/types/api';

export type LanguageCode = 'en' | 'ar';
export type ThemeMode = 'light' | 'dark';

export const CURRENCY_RATES: Record<CurrencyCode, { symbolEn: string; symbolAr: string; rateFromBase: number }> = {
  EGP: { symbolEn: 'EGP', symbolAr: 'ج.م', rateFromBase: 1.0 },
  SAR: { symbolEn: 'SAR', symbolAr: 'ر.س', rateFromBase: 0.076 },
  AED: { symbolEn: 'AED', symbolAr: 'د.إ', rateFromBase: 0.075 },
  USD: { symbolEn: 'USD', symbolAr: '$', rateFromBase: 0.020 },
  KWD: { symbolEn: 'KWD', symbolAr: 'د.ك', rateFromBase: 0.0063 },
};

interface ThemeState {
  theme: ThemeMode;
  language: LanguageCode;
  currency: CurrencyCode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
  setCurrency: (curr: CurrencyCode) => void;
  formatPrice: (amountInEGP: number) => string;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark', // Haute-couture royal midnight
      language: 'ar', // Default Arabic for Egyptian market
      currency: 'EGP', // Default Egyptian Pound

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      setLanguage: (language) => {
        set({ language });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('lang', language);
          document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        }
      },

      toggleLanguage: () => {
        const next = get().language === 'en' ? 'ar' : 'en';
        get().setLanguage(next);
      },

      setCurrency: (currency) => set({ currency }),

      formatPrice: (amountInEGP: number) => {
        const { currency, language } = get();
        const config = CURRENCY_RATES[currency] || CURRENCY_RATES.EGP;
        const converted = (amountInEGP * config.rateFromBase).toLocaleString(
          language === 'ar' ? 'ar-EG' : 'en-US',
          {
            minimumFractionDigits: currency === 'KWD' ? 3 : 0,
            maximumFractionDigits: currency === 'KWD' ? 3 : 2,
          }
        );
        const symbol = language === 'ar' ? config.symbolAr : config.symbolEn;
        return language === 'ar' ? `${converted} ${symbol}` : `${symbol} ${converted}`;
      },
    }),
    {
      name: 'abaya_theme_settings_v2',
    }
  )
);
