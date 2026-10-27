import { MetadataRoute } from 'next';
import { productsService } from '@/api/products';
import { categoriesService } from '@/api/categories';

export const revalidate = 3600; // Cache dynamic sitemap for 1 hour on Vercel CDN

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  try {
    const [productsRes, categoriesRes] = await Promise.allSettled([
      productsService.getProducts({ pageSize: 500 }),
      categoriesService.getCategories(),
    ]);

    const productUrls: MetadataRoute.Sitemap =
      productsRes.status === 'fulfilled' && productsRes.value?.data
        ? productsRes.value.data.map((p) => ({
            url: `${baseUrl}/product/${p.id}`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
          }))
        : [];

    const categoryUrls: MetadataRoute.Sitemap =
      categoriesRes.status === 'fulfilled' && categoriesRes.value
        ? categoriesRes.value.map((c) => ({
            url: `${baseUrl}/shop?categoryId=${c.id}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
          }))
        : [];

    return [...staticRoutes, ...productUrls, ...categoryUrls];
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return staticRoutes;
  }
}
