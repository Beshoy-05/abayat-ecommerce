
import type { MetadataRoute } from 'next';
import { productsService } from '@/api/products';
import { categoriesService } from '@/api/categories';

export const revalidate = 300; // Revalidate sitemap every 5 minutes

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
  'https://qasr-alabaya.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/returns`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const [productsResult, categoriesResult] = await Promise.allSettled([
    productsService.getProducts({ pageSize: 500 }),
    categoriesService.getCategories(),
  ]);

  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];

  if (productsResult.status === 'fulfilled') {
    const products = productsResult.value?.data;

    if (Array.isArray(products)) {
      productUrls = products
        .filter((product) => product?.id != null)
        .map((product) => ({
          url: `${BASE_URL}/product/${product.id}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }));

      console.info(
        `[Sitemap] Generated ${productUrls.length} product URLs.`,
      );
    } else {
      console.error(
        '[Sitemap] Products API returned an unexpected response.',
      );
    }
  } else {
    console.error(
      '[Sitemap] Failed to fetch products:',
      productsResult.reason,
    );
  }

  if (categoriesResult.status === 'fulfilled') {
    const categories = categoriesResult.value;

    if (Array.isArray(categories)) {
      categoryUrls = categories
        .filter((category) => category?.id != null)
        .map((category) => ({
          url: `${BASE_URL}/shop?categoryId=${category.id}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
    } else {
      console.error(
        '[Sitemap] Categories API returned an unexpected response.',
      );
    }
  } else {
    console.error(
      '[Sitemap] Failed to fetch categories:',
      categoriesResult.reason,
    );
  }

  const allUrls = [
    ...staticRoutes,
    ...productUrls,
    ...categoryUrls,
  ];

  // Avoid duplicate URLs.
  const uniqueUrls = Array.from(
    new Map(allUrls.map((item) => [item.url, item])).values(),
  );

  console.info(`[Sitemap] Total URLs: ${uniqueUrls.length}`);

  return uniqueUrls;
}
