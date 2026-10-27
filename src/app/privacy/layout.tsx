import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية وأمان البيانات | قصر العباية',
  description:
    'سياسة الخصوصية وحماية بيانات العملاء في دار قصر العباية. نلتزم بأعلى معايير التشفير والأمان لضمان سرية معلوماتك الشخصية وبيانات الدفع.',
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
  openGraph: {
    title: 'سياسة الخصوصية وأمان البيانات | قصر العباية',
    description: 'التزامنا الكامل بحماية وتأمين سرية بيانات عملاء الدار.',
    url: `${baseUrl}/privacy`,
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
