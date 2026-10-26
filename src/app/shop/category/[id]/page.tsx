'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { productsService } from '@/api/products';
import { categoriesService } from '@/api/categories';
import { Product, Category } from '@/types/api';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import ProductCard from '@/components/ui/ProductCard';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export default function CategoryPage() {
  const { id } = useParams();
  const { language } = useThemeStore();
  const t = translations[language];

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const [catData, prodData] = await Promise.all([
          categoriesService.getCategoryById(id as string),
          productsService.getProducts({ categoryId: Number(id), pageSize: 24 }),
        ]);
        setCategory(catData);
        setProducts(prodData.data || []);
      } catch (err) {
        console.error('Failed to fetch category:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[var(--accent-gold)] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{language === 'ar' ? 'العودة لجميع المجموعات' : 'Back to All Collections'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <ShimmerBadge icon={<Sparkles className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'المجموعة الملكية' : 'Curated Category'}
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-[var(--text-primary)]">
          {category ? category.name : 'Haute Couture Category'}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          {products.length} {language === 'ar' ? 'تصاميم حصرية متوفرة في المشغل' : 'exclusive atelier pieces'}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="aspect-[3/4] rounded-2xl bg-[var(--bg-secondary)] shimmer-anim" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] space-y-4">
          <p className="font-serif text-lg text-[var(--text-primary)]">{t.catalog.noResults}</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 rounded-full bg-[var(--accent-gold)] text-black text-xs font-bold uppercase tracking-wider"
          >
            {language === 'ar' ? 'عرض الكتالوج الكامل' : 'Browse All Pieces'}
          </Link>
        </div>
      )}
    </div>
  );
}
