import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

export const metadata: Metadata = {
  title: 'تواصل مع الكونسيرج الملكي وخدمة العملاء | قصر العباية',
  description:
    'فريق كونسيرج قصر العباية في خدمتكم على مدار الساعة للاستفسارات، الطلبات الخاصة، وخدمة العملاء عبر واتساب، الهاتف أو البريد الإلكتروني. مقرنا: أبو كبير، الشرقية.',
  keywords: [
    'تواصل قصر العباية',
    'خدمة عملاء قصر العباية',
    'عنوان قصر العباية',
    'رقم قصر العباية',
    'كونسيرج العبايات',
  ],
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
  openGraph: {
    title: 'تواصل مع الكونسيرج الملكي | قصر العباية',
    description:
      'يسعدنا الرد على جميع استفساراتكم ومساعدتكم في اختيار مقاسكم وتفصيل عبايتكم الخاصة.',
    url: `${baseUrl}/contact`,
    siteName: 'قصر العباية',
    type: 'website',
    locale: 'ar_EG',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'تواصل مع دار قصر العباية',
    description: 'صفحة التواصل وخدمة العملاء والكونسيرج الخاص بدار قصر العباية.',
    url: `${baseUrl}/contact`,
    mainEntity: {
      '@type': 'ClothingStore',
      name: 'قصر العباية',
      telephone: '+201096212029',
      email: 'support@qasr-alabaya.vercel.app',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'أبو كبير، محافظة الشرقية',
        addressLocality: 'أبو كبير',
        addressRegion: 'الشرقية',
        postalCode: '44671',
        addressCountry: 'EG',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'تواصل معنا',
        item: `${baseUrl}/contact`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
