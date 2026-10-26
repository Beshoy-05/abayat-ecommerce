import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://abaya-luxury.com';

  const robots = `# Google Search Console Robots Directive for L'ÉLÉGANCE Atelier
User-agent: *
Allow: /
Allow: /shop
Allow: /product/
Allow: /about
Allow: /contact
Allow: /shipping
Allow: /returns
Allow: /terms
Allow: /privacy

# Disallow private client and transaction routes
Disallow: /cart
Disallow: /checkout
Disallow: /account
Disallow: /orders
Disallow: /login
Disallow: /register

# Direct pointer to dynamic sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
