import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

export const metadata: Metadata = {
  title: 'عن دار قصر العباية | أصالة الحرفة وتاريخ الهوت كوتور الملكي',
  description:
    'تعرفي على رحلة دار قصر العباية في إعادة صياغة مفهوم العباءة التقليدية إلى تحفة فنية من الكوتور، بحرير ياباني خالص وكريب صالونا إيطالي وأيدي نخبة الحرفيين.',
  keywords: [
    'عن قصر العباية',
    'تاريخ قصر العباية',
    'دار أزياء عبايات مصر',
    'حرفة تفصيل العبايات',
    'عبايات هوت كوتور الشرقية',
  ],
  alternates: {
    canonical: `${baseUrl}/about`,
  },
  openGraph: {
    title: 'عن دار قصر العباية | أصالة الحرفة وتاريخ الهوت كوتور',
    description:
      'قصة دار قصر العباية في ابتكار أرقى العبايات الملكية من الحرير والكريب الأصلي بتطريز يدوي فاخر.',
    url: `${baseUrl}/about`,
    siteName: 'قصر العباية',
    images: [
      {
        url: 'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg',
        width: 1200,
        height: 630,
        alt: 'دار قصر العباية للهوت كوتور',
      },
    ],
    type: 'article',
    locale: 'ar_EG',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'عن دار قصر العباية',
    description: 'قصة نشأة وحرفة دار قصر العباية للأزياء الملكية والعبايات الراقية.',
    url: `${baseUrl}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: 'قصر العباية',
      url: baseUrl,
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
        name: 'عن الدار',
        item: `${baseUrl}/about`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
