import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

export const metadata: Metadata = {
  title: 'سياسة الاستبدال والاسترجاع (14 يوماً) | قصر العباية',
  description:
    'حق المعاينة والاستبدال مكفول لمدة 14 يوماً بالكامل وفقاً لقانون حماية المستهلك المصري رقم 181 لسنة 2018. استبدال فوري وسلس دون أي تعقيدات.',
  alternates: {
    canonical: `${baseUrl}/returns`,
  },
  openGraph: {
    title: 'سياسة الاستبدال والاسترجاع (14 يوماً) | قصر العباية',
    description:
      'حق المعاينة والاستبدال مكفول لمدة 14 يوماً وفق أحكام قانون حماية المستهلك المصري.',
    url: `${baseUrl}/returns`,
  },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
