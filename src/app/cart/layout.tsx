import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حقيبة التسوق الملكية | قصر العباية',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
