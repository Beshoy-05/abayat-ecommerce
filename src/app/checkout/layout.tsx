import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إتمام الطلب والدفع الآمن | قصر العباية',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
