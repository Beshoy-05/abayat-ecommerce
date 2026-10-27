import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

export const metadata: Metadata = {
  title: 'سياسة الشحن والتوصيل الفاخر | قصر العباية',
  description:
    'شحن متميز وسريع لجميع محافظات مصر ودول الخليج. تغليف ملكي فاخر، تتبع الشحنة لحظة بلحظة، وحق المعاينة قبل الاستلام والدفع.',
  alternates: {
    canonical: `${baseUrl}/shipping`,
  },
  openGraph: {
    title: 'سياسة الشحن والتوصيل الفاخر | قصر العباية',
    description: 'تفاصيل الشحن السريع والتغليف الملكي الفاخر لكافة المحافظات.',
    url: `${baseUrl}/shipping`,
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
