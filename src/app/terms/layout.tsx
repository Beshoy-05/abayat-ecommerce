import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

export const metadata: Metadata = {
  title: 'الشروط والأحكام | دار قصر العباية',
  description:
    'الشروط والأحكام وسياسات البيع والتعامل التجاري لدار قصر العباية، خاضعة لأحكام قانون التجارة وحماية المستهلك المصري.',
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
  openGraph: {
    title: 'الشروط والأحكام | دار قصر العباية',
    description: 'الأطر القانونية وسياسات البيع المنظمة لتعاملات عملاء دار قصر العباية.',
    url: `${baseUrl}/terms`,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
