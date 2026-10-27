import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'قصر العباية | دار عبايات الهوت كوتور والحرير الملكي',
    short_name: 'قصر العباية',
    description:
      'تسوقي أرقى العبايات السوداء الملكية وعبايات الهوت كوتور المصنوعة يدوياً من الحرير الياباني الخالص والكريب الإيطالي الفاخر.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0c',
    theme_color: '#c5a880',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
