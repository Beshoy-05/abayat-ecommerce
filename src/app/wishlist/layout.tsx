import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قائمة الأمنيات والقطع المفضلة | قصر العباية',
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
