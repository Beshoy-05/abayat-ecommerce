import { NextResponse } from 'next/server';
import { productsService } from '@/api/products';
import { categoriesService } from '@/api/categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://abaya-luxury.com';
  const currentDate = new Date().toISOString();

  // Static core routes
  const staticRoutes = [
    { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/shop`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/about`, priority: '0.8', changefreq: 'monthly' },
    { url: `${baseUrl}/contact`, priority: '0.8', changefreq: 'monthly' },
    { url: `${baseUrl}/shipping`, priority: '0.7', changefreq: 'monthly' },
    { url: `${baseUrl}/returns`, priority: '0.7', changefreq: 'monthly' },
    { url: `${baseUrl}/terms`, priority: '0.6', changefreq: 'yearly' },
    { url: `${baseUrl}/privacy`, priority: '0.6', changefreq: 'yearly' },
  ];

  let dynamicRoutes: Array<{ url: string; priority: string; changefreq: string }> = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      productsService.getProducts({ pageSize: 100 }),
      categoriesService.getCategories(),
    ]);

    const productUrls = (productsRes.data || []).map((p) => ({
      url: `${baseUrl}/product/${p.id}`,
      priority: '0.9',
      changefreq: 'daily',
    }));

    const categoryUrls = (categoriesRes || []).map((c) => ({
      url: `${baseUrl}/shop?categoryId=${c.id}`,
      priority: '0.8',
      changefreq: 'weekly',
    }));

    dynamicRoutes = [...productUrls, ...categoryUrls];
  } catch (err) {
    console.error('Error generating dynamic sitemap:', err);
  }

  const allUrls = [...staticRoutes, ...dynamicRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (item) => `
    <url>
      <loc>${item.url}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>${item.changefreq}</changefreq>
      <priority>${item.priority}</priority>
    </url>
  `
    )
    .join('')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
