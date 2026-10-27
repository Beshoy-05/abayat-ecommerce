import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productsService } from '@/api/products';
import { reviewsService } from '@/api/reviews';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export const revalidate = 3600; // Incremental Static Regeneration: Cache 1 hour on Vercel CDN

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

  if (!id) {
    return {
      title: 'القطعة غير متوفرة | قصر العباية',
    };
  }

  try {
    const product = await productsService.getProductById(id);
    if (!product) {
      return {
        title: 'القطعة غير متوفرة | قصر العباية',
        description: 'عذراً، القطعة المطلوبة غير متوفرة حالياً في دار قصر العباية.',
      };
    }

    const cleanDesc = (product.description || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 155);

    const title = `${product.name} | حرير ياباني كوتور | قصر العباية`;
    const canonicalUrl = `${baseUrl}/product/${id}`;
    const mainImage =
      product.images?.[0] ||
      product.pictureUrl ||
      'https://res.cloudinary.com/moak0zto/image/upload/v1792652133/abaya-ecommerce/abaya-ecommerce/1000646012_20261022065532_152bcfffeb5747e889d6560f74eb66ea.jpg';

    return {
      title,
      description: cleanDesc,
      keywords: [
        product.name,
        product.categoryName || 'عبايات فاخرة',
        'قصر العباية',
        'عبايات سوداء ملكية',
        'حرير ياباني طبيعي',
        'كريب صالونا أصلي',
        'تفصيل عبايات راقية',
      ],
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'ar-EG': canonicalUrl,
          'ar-SA': canonicalUrl,
          'ar': canonicalUrl,
          'en-US': `${baseUrl}/en/product/${id}`,
          'x-default': canonicalUrl,
        },
      },
      openGraph: {
        title,
        description: cleanDesc,
        url: canonicalUrl,
        siteName: 'قصر العباية',
        images: [
          {
            url: mainImage,
            width: 1200,
            height: 1600,
            alt: `${product.name} - قصر العباية`,
          },
        ],
        type: 'website',
        locale: 'ar_EG',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: cleanDesc,
        images: [mainImage],
      },
    };
  } catch (err) {
    console.error('Failed to generate product metadata:', err);
    return {
      title: 'عباية هوت كوتور ملكية | قصر العباية',
      description: 'أرقى العبايات الملكية المصنوعة من الحرير الياباني والكريب الفاخر.',
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qasr-alabaya.vercel.app';

  if (!id) {
    notFound();
  }

  let product = null;
  let reviewsData = null;
  try {
    const [prodRes, revRes] = await Promise.allSettled([
      productsService.getProductById(id),
      reviewsService.getProductReviews(id),
    ]);
    if (prodRes.status === 'fulfilled') {
      product = prodRes.value;
    }
    if (revRes.status === 'fulfilled') {
      reviewsData = revRes.value;
    }
  } catch (err) {
    console.error(`Failed to fetch product ${id} on server:`, err);
  }

  if (!product) {
    notFound();
  }

  const effectivePrice = product.finalPrice ?? product.price;
  const images = (product.images && product.images.length > 0)
    ? product.images
    : product.pictureUrl
    ? [product.pictureUrl]
    : [];

  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 1;

  // Production-Ready Product & AggregateOffer Schema (JSON-LD)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/product/${product.id}#product`,
    name: product.name,
    image: images,
    description: product.description,
    sku: `QA-ABAYA-${product.id}`,
    mpn: `QA-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'قصر العباية',
    },
    material: '100% Pure Japanese Silk & Royal Black Crepe',
    category: product.categoryName || 'عبايات هوت كوتور',
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.id}`,
      priceCurrency: 'EGP',
      price: effectivePrice,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'قصر العباية',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'EG',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
        customerRemorseReturnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '65.00',
          currency: 'EGP',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'EG',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd',
          },
        },
      },
    },
    ...(reviewsData?.totalReviews && reviewsData.totalReviews > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewsData.averageRating,
            reviewCount: reviewsData.totalReviews,
          },
        }
      : {}),
  };

  return (
    <>
      {/* 🚀 Server-Side Rich Snippets JSON-LD for Googlebot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* 👑 Interactive Client Island */}
      <ProductDetailClient initialProduct={product} id={id} />
    </>
  );
}
