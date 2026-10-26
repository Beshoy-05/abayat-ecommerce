import { create } from 'zustand';
import { SiteSettingDto } from '@/types/api';
import { settingsService } from '@/api/settings';

const DEFAULT_HERO = {
  heroBadge: 'كوتور فاخر 2026/2027',
  heroTitle: 'حرير ياباني ملكي وتطريز يدوي فاخر',
  heroSubtitle:
    'عبايات منسوجة من أرقى أقمشة الكريب والحرير الإيطالي الخالص، مطرزة بخيوط القصب والذهب لأصحاب الذوق الرفيع في مصر والشرق الأوسط.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
  heroCardTag: 'تشكيلة الموسم',
  heroCardTitle: 'عباية الحرير الملكي المطرزة',
};

const LOCAL_STORAGE_KEY = 'abaya_site_hero_settings';

const getStoredHero = (): Partial<SiteSettingDto> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const DEFAULT_SETTINGS: SiteSettingDto = {
  id: 1,
  storeName: "L'ÉLÉGANCE ABAYA ATELIER",
  aboutUs:
    'أهلاً بكم في دار الأناقة للهوت كوتور والعبايات الملكية الفاخرة. متجرنا متخصص في تقديم أرقى وأحدث تصاميم العبايات العصرية والتقليدية بأعلى جودة وخامات حراير يابانية وإيطالية نادرة.',
  contactEmail: 'contact@abaya-luxury.com',
  contactPhone: '+201096212029',
  address: 'أبو كبير - محافظة الشرقية، جمهورية مصر العربية',
  whatsappNumber: '+201096212029',
  facebookUrl: 'https://facebook.com/abaya',
  instagramUrl: 'https://instagram.com/abaya',
  twitterUrl: null,
  tiktokUrl: 'https://tiktok.com/@abaya',
  snapchatUrl: null,
  privacyPolicy:
    'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفقاً لأعلى معايير حماية البيانات وقوانين حماية المستهلك. يتم جمع البيانات فقط لمعالجة الطلبات والتوصيل السريع ولا يتم مشاركتها إطلاقاً مع أطراف خارجية.',
  returnPolicy:
    'حق المعاينة والاستبدال مكفول لمدة 14 يوماً من تاريخ الاستلام. يمكن استبدال أو استرجاع المنتجات بشرط بقاء القطعة في حالتها الأصلية وبطاقتها التابعة للدار وغلافها الفاخر دون أي تعديل أو استخدام.',
  shippingPolicy:
    'يتم الشحن والتوصيل الفاخر لباب البيت خلال 24 إلى 48 ساعة لكافة محافظات مصر (القاهرة، الجيزة، الإسكندرية، الدلتا والصعيد). التوصيل مجاني للطلبات المميزة مع إمكانية التتبع الفوري.',
  announcementBarText: 'توصيل سريع مجاني لكافة محافظات مصر | تشكيلة الكوتور الملكية متاحة الآن',
  isAnnouncementBarActive: true,
  ...DEFAULT_HERO,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

interface SiteSettingsState {
  settings: SiteSettingDto;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  setSettings: (settings: SiteSettingDto) => void;
}

export const useSiteSettingsStore = create<SiteSettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  isInitialized: false,
  error: null,

  fetchSettings: async () => {
    // If local hero was saved in browser localStorage, apply it safely on client side
    const localHero = getStoredHero();
    if (Object.keys(localHero).length > 0) {
      set((state) => ({
        settings: {
          ...state.settings,
          ...localHero,
        },
      }));
    }

    // Prevent duplicate fetch if already loading
    if (get().isLoading) return;
    try {
      set({ isLoading: true, error: null });
      const data = await settingsService.getSettings();
      const localHero = getStoredHero();
      if (data && data.storeName) {
        set({
          settings: {
            ...DEFAULT_SETTINGS,
            ...data,
            heroBadge: data.heroBadge || localHero.heroBadge || DEFAULT_HERO.heroBadge,
            heroTitle: data.heroTitle || localHero.heroTitle || DEFAULT_HERO.heroTitle,
            heroSubtitle: data.heroSubtitle || localHero.heroSubtitle || DEFAULT_HERO.heroSubtitle,
            heroImageUrl: data.heroImageUrl || localHero.heroImageUrl || DEFAULT_HERO.heroImageUrl,
            heroCardTag: data.heroCardTag || localHero.heroCardTag || DEFAULT_HERO.heroCardTag,
            heroCardTitle: data.heroCardTitle || localHero.heroCardTitle || DEFAULT_HERO.heroCardTitle,
          },
          isInitialized: true,
        });
      }
    } catch (err: any) {
      console.warn('Could not fetch live site settings from API, using defaults:', err.message);
      // Still mark as initialized so UI can render defaults smoothly
      set({ isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  setSettings: (updated: SiteSettingDto) => {
    if (typeof window !== 'undefined') {
      try {
        const heroData = {
          heroBadge: updated.heroBadge,
          heroTitle: updated.heroTitle,
          heroSubtitle: updated.heroSubtitle,
          heroImageUrl: updated.heroImageUrl,
          heroCardTag: updated.heroCardTag,
          heroCardTitle: updated.heroCardTitle,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(heroData));
      } catch (e) {
        console.warn('Could not cache hero settings in localStorage:', e);
      }
    }
    set({ settings: { ...get().settings, ...updated } });
  },
}));
