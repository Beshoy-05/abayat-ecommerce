import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سجل الطلبات وتتبع الشحنات | قصر العباية',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
