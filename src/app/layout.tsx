import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, Cormorant_Garamond, Cairo, Amiri } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import LenisProvider from '@/providers/LenisProvider';
import LuxuryHeader from '@/components/ui/LuxuryHeader';
import LuxuryFooter from '@/components/ui/LuxuryFooter';
import CartSlideOver from '@/components/ui/CartSlideOver';
import SearchModal from '@/components/ui/SearchModal';
import GlobalNotificationBanner from '@/components/ui/GlobalNotificationBanner';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-arabic-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "قصر العباية | دار عبايات الهوت كوتور والحرير الملكي",
    template: "%s | قصر العباية",
  },
  description:
    "تسوقي أفخم العبايات السوداء الملكية وعبايات المناسبات من الحرير الياباني الخالص والكريب الإيطالي الفاخر بتطريز يدوي. معاينة واستبدال 14 يوماً ودفع عند الاستلام وإنستاباي.",
  keywords: [
    'قصر العباية',
    'عبايات سوداء ملكية',
    'عبايات هوت كوتور',
    'عبايات مناسبات فاخرة',
    'حرير ياباني طبيعي',
    'كريب صالونا أصلي',
    'تفصيل عبايات راقية',
    'luxury abayas egypt',
    'royal silk abaya',
    'haute couture abaya atelier',
    'عبايات الشرقية أبو كبير',
  ],
  authors: [{ name: 'قصر العباية' }],
  creator: 'قصر العباية',
  publisher: 'قصر العباية',
  openGraph: {
    title: 'قصر العباية | دار عبايات الهوت كوتور والحرير الملكي',
    description: 'أرقى العبايات الملكية المصنوعة يدوياً من الحرير الياباني والكريب الفاخر. توصيل سريع لكافة المحافظات.',
    url: siteUrl,
    siteName: 'قصر العباية',
    images: [
      {
        url: 'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg',
        width: 1200,
        height: 630,
        alt: 'تشكيلة قصر العباية للهوت كوتور والحرير الملكي',
      },
    ],
    locale: 'ar_EG',
    alternateLocale: ['ar_SA', 'ar_AE', 'en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'قصر العباية | دار عبايات الهوت كوتور',
    description: 'أرقى العبايات الملكية المصنوعة من أفخر الخامات وأحدث التصاميم.',
    images: ['https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'ar-EG': '/',
      'ar-SA': '/',
      'ar': '/',
      'en-US': '/en',
      'x-default': '/',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

  // Comprehensive Enterprise E-commerce Schema Markup (JSON-LD)
  const enterpriseSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ClothingStore', 'LocalBusiness'],
        '@id': `${currentBaseUrl}/#organization`,
        name: 'قصر العباية',
        alternateName: ['Qasr Al-Abaya', 'دار قصر العباية للهوت كوتور'],
        url: currentBaseUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${currentBaseUrl}/#logo`,
          url: `${currentBaseUrl}/favicon.ico`,
          caption: 'شعار دار قصر العباية للأزياء الملكية',
          width: 512,
          height: 512,
        },
        image: 'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg',
        description: 'دار أزياء مصرية متخصصة في ابتكار وتفصيل عبايات الهوت كوتور الفاخرة من الحرير الياباني والكريب الإيطالي الخالص، مع الالتزام التام بقانون حماية المستهلك المصري رقم 181 لسنة 2018.',
        telephone: '+201096212029',
        email: 'support@qasr-alabaya.vercel.app',
        priceRange: '$$$',
        currenciesAccepted: 'EGP, SAR, AED, USD, KWD',
        paymentAccepted: 'Cash, Credit Card, Vodafone Cash, InstaPay',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'أبو كبير، محافظة الشرقية',
          addressLocality: 'أبو كبير',
          addressRegion: 'الشرقية',
          postalCode: '44671',
          addressCountry: 'EG',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 30.7264,
          longitude: 31.6714,
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'EG',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 14,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
          customerRemorseReturnFees: 'https://schema.org/FreeReturn',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+201096212029',
            contactType: 'Customer Care & Private Concierge',
            areaServed: ['EG', 'SA', 'AE', 'QA', 'KW'],
            availableLanguage: ['Arabic', 'English'],
          },
        ],
        sameAs: [
          'https://www.facebook.com',
          'https://www.instagram.com',
          'https://www.tiktok.com',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${currentBaseUrl}/#website`,
        url: currentBaseUrl,
        name: 'قصر العباية',
        publisher: {
          '@id': `${currentBaseUrl}/#organization`,
        },
        inLanguage: ['ar-EG', 'en-US'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${currentBaseUrl}/shop?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`dark ${playfair.variable} ${plusJakarta.variable} ${cormorant.variable} ${cairo.variable} ${amiri.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(enterpriseSchema) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased selection:bg-[var(--accent-gold)] selection:text-black"
      >
        <QueryProvider>
          <LenisProvider>
            {/* Subtle grain overlay for authentic film/couture feel */}
            <div className="grain-overlay" />

            {/* Global API rate limit / 401 toast banner */}
            <GlobalNotificationBanner />

            {/* Haute-Couture Glassmorphic Sticky Header */}
            <LuxuryHeader />

            {/* Main Application Page Content */}
            <main className="flex-1 w-full">{children}</main>

            {/* Slide-over Mini Bag */}
            <CartSlideOver />

            {/* Interactive Luxury Search Modal */}
            <SearchModal />

            {/* Haute-Couture Editorial Footer */}
            <LuxuryFooter />
          </LenisProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
