import React from 'react';
import HomeClient from './HomeClient';
import { PaginatedList, Product, SiteSettingDto } from '@/types/api';

export const revalidate = 30; // Revalidate homepage SSR cache every 30s for instant TTFB + fresh CMS updates

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://abaya-ecommerce.runasp.net';

async function getInitialSettings(): Promise<SiteSettingDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    return (await res.json()) as SiteSettingDto;
  } catch {
    return null;
  }
}

async function getInitialProducts(): Promise<Product[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/Products?pageSize=8`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as PaginatedList<Product>;
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [initialSettings, initialProducts] = await Promise.all([
    getInitialSettings(),
    getInitialProducts(),
  ]);

  return (
    <HomeClient
      initialSettings={initialSettings}
      initialProducts={initialProducts}
    />
  );
}
