import type { Metadata } from 'next';
import { categoriesService } from '@/api/categories';

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const id = resolved?.id;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

  if (!id) {
    return { title: 'مجموعة العبايات | قصر العباية' };
  }

  try {
    const cat = await categoriesService.getCategoryById(id);
    const catName = cat?.name || 'مجموعة عبايات فاخرة';
    const title = `${catName} | تشكيلة حصرية | دار قصر العباية`;
    const description = `استكشفي أرقى تصاميم ${catName} المصنوعة يدوياً من الحرير الياباني والكريب الملكي الفاخر في دار قصر العباية. معاينة واستبدال 14 يوماً.`;
    const canonicalUrl = `${baseUrl}/shop?categoryId=${id}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'قصر العباية',
        locale: 'ar_EG',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'مجموعة العبايات الفاخرة | قصر العباية',
      description: 'أرقى العبايات الملكية المصنوعة من أفخر الخامات وأحدث التصاميم.',
    };
  }
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
