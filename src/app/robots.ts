import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/product/',
          '/about',
          '/contact',
          '/shipping',
          '/returns',
          '/terms',
          '/privacy',
        ],
        disallow: [
          '/cart',
          '/checkout',
          '/account',
          '/orders',
          '/login',
          '/register',
          '/admin',
          '/api/',
          '/*?*sortingOption=*',
          '/*?*minPrice=*',
          '/*?*maxPrice=*',
          '/*?*color=*',
          '/*?*size=*',
          '/*?*search=*',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/_next/image/', '/api/images/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
