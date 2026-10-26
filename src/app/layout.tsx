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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://abaya-luxury.com'),
  title: {
    default: "L'ÉLÉGANCE | Haute Couture Abayas & Royal Silks",
    template: "%s | L'ÉLÉGANCE Atelier",
  },
  description:
    "Explore bespoke luxury Abayas handcrafted with authentic Japanese crepes, French lace, and pure Italian silks. Express white-glove delivery across Saudi Arabia, UAE, and GCC.",
  keywords: [
    'luxury abaya',
    'haute couture abaya',
    'عبايات فاخرة',
    'عبايات مناسبات',
    'حرير ياباني',
    'royal abaya',
    'dubai luxury abayas',
    'riyadh couture',
    'bespoke abaya atelier',
  ],
  authors: [{ name: "L'ÉLÉGANCE Haute Couture" }],
  openGraph: {
    title: "L'ÉLÉGANCE | Haute Couture Abaya Atelier",
    description: "The pinnacle of Middle Eastern elegance. Handcrafted bespoke royal abayas.",
    url: 'https://abaya-luxury.com',
    siteName: "L'ÉLÉGANCE Atelier",
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: "L'ÉLÉGANCE Haute Couture Abaya Collection",
      },
    ],
    locale: 'en_US',
    alternateLocale: ['ar_SA', 'ar_AE'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "L'ÉLÉGANCE | Haute Couture Abayas",
    description: "Handcrafted royal silken abayas with express white-glove GCC dispatch.",
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80'],
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Luxury Organization Schema (JSON-LD)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "L'ÉLÉGANCE Haute Couture Abaya Atelier",
    url: 'https://abaya-luxury.com',
    logo: 'https://abaya-luxury.com/logo.png',
    description: 'Premier Middle Eastern Haute Couture House specializing in bespoke royal abayas.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Abu Kabir',
      addressLocality: 'Abu Kabir',
      addressRegion: 'Sharqia',
      postalCode: '44671',
      addressCountry: 'EG',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+20 10 96212029',
      contactType: 'Customer Care & Private Concierge',
      areaServed: ['EG', 'SA', 'AE', 'QA', 'KW'],
      availableLanguage: ['Arabic', 'English'],
    },
    sameAs: [
      'https://www.instagram.com',
      'https://www.facebook.com',
      'https://www.tiktok.com',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
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
