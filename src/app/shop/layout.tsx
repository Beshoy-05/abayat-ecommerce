import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

export const metadata: Metadata = {
  title: 'المتجر والتشكيلة الملكية | دار قصر العباية للهوت كوتور',
  description:
    'تسوقي أحدث تشكيلات العبايات السوداء الملكية، عبايات السهرة، وعبايات الحرير الياباني الخالص والكريب الإيطالي بتطريز يدوي فاخر. معاينة واستبدال 14 يوماً مع دفع عند الاستلام وإنستاباي.',
  keywords: [
    'تسوق عبايات',
    'عبايات كوتور',
    'عبايات سوداء ملكية',
    'عبايات سهرة فاخرة',
    'حرير ياباني',
    'كريب صالونا',
    'قصر العباية المتجر',
    'شراء عبايات اونلاين مصر',
  ],
  alternates: {
    canonical: `${baseUrl}/shop`,
    languages: {
      'ar-EG': `${baseUrl}/shop`,
      'ar-SA': `${baseUrl}/shop`,
      'ar': `${baseUrl}/shop`,
      'en-US': `${baseUrl}/en/shop`,
      'x-default': `${baseUrl}/shop`,
    },
  },
  openGraph: {
    title: 'المتجر والتشكيلة الملكية | دار قصر العباية',
    description:
      'تشكيلة متجددة من أرقى العبايات الملكية المصنوعة يدوياً من الحرير الطبيعي والكريب الفاخر. توصيل سريع لجميع المحافظات.',
    url: `${baseUrl}/shop`,
    siteName: 'قصر العباية',
    images: [
      {
        url: 'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg',
        width: 1200,
        height: 630,
        alt: 'تشكيلة متجر قصر العباية الملكي',
      },
    ],
    type: 'website',
    locale: 'ar_EG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'المتجر والتشكيلة الملكية | قصر العباية',
    description:
      'تسوقي أحدث تشكيلات عبايات الهوت كوتور والحرير الياباني من دار قصر العباية.',
    images: [
      'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg',
    ],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
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
        name: 'المتجر الملكي',
        item: `${baseUrl}/shop`,
      },
    ],
  };

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'المتجر والتشكيلة الملكية | قصر العباية',
    description:
      'تشكيلة فاخرة من العبايات الكوتور والحرير الياباني الطبيعي من دار قصر العباية.',
    url: `${baseUrl}/shop`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'قصر العباية',
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      {children}
    </>
  );
}
