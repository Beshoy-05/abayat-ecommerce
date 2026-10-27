'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  ArrowUpDown,
  Grid3X3,
  LayoutGrid,
} from 'lucide-react';
import { productsService } from '@/api/products';
import { categoriesService } from '@/api/categories';
import { Product, Category, ProductFilterParams } from '@/types/api';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import { trackViewItemList } from '@/utils/analytics';
import ProductCard from '@/components/ui/ProductCard';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

const COLOR_MAPPINGS: Record<string, string> = {
  black: 'أسود ملكي',
  beige: 'بيج رملي',
  navy: 'كحلي داكن',
  green: 'زيتي فاخر',
  burgundy: 'عنابي ملكي',
  brown: 'بني شوكولاتة',
  grey: 'رمادي لؤلؤي',
  gray: 'رمادي لؤلؤي',
};

const normalizeColorParam = (rawColor: string | null): string => {
  if (!rawColor) return '';
  const decoded = decodeURIComponent(rawColor).trim();
  const lower = decoded.toLowerCase();
  return COLOR_MAPPINGS[lower] || decoded;
};

const BASE_PRESET_COLORS = [
  { nameEn: 'Royal Black', nameAr: 'أسود ملكي', query: 'أسود ملكي' },
  { nameEn: 'Midnight Navy', nameAr: 'كحلي داكن', query: 'كحلي داكن' },
  { nameEn: 'Desert Beige', nameAr: 'بيج رملي', query: 'بيج رملي' },
  { nameEn: 'Olive Green', nameAr: 'زيتي فاخر', query: 'زيتي فاخر' },
  { nameEn: 'Royal Burgundy', nameAr: 'عنابي ملكي', query: 'عنابي ملكي' },
  { nameEn: 'Chocolate Brown', nameAr: 'بني شوكولاتة', query: 'بني شوكولاتة' },
  { nameEn: 'Pearl Grey', nameAr: 'رمادي لؤلؤي', query: 'رمادي لؤلؤي' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const { language } = useThemeStore();
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string>(() =>
    normalizeColorParam(searchParams.get('color'))
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    searchParams.get('size') || ''
  );
  const [sortingOption, setSortingOption] = useState<number>(
    searchParams.get('sort') ? Number(searchParams.get('sort')) : 0
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || ''
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(3);

  // Sync selectedColor if URL searchParams change
  useEffect(() => {
    const paramColor = searchParams.get('color');
    if (paramColor !== null) {
      setSelectedColor(normalizeColorParam(paramColor));
    }
  }, [searchParams]);

  // Combine preset colors with any unique colors present in loaded products
  const availableColors = React.useMemo(() => {
    const list = [...BASE_PRESET_COLORS];
    const seen = new Set(list.map((c) => c.query));

    products.forEach((p) => {
      (p.colorGroups || []).forEach((cg) => {
        const trimmed = cg.color?.trim();
        if (trimmed && !seen.has(trimmed)) {
          seen.add(trimmed);
          list.push({
            nameEn: trimmed,
            nameAr: trimmed,
            query: trimmed,
          });
        }
      });
    });

    return list;
  }, [products]);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Free Size'];

  const sortingOptions = [
    { value: 0, label: t.catalog.sortDefault },
    { value: 1, label: t.catalog.sortNameAsc },
    { value: 2, label: t.catalog.sortNameDesc },
    { value: 3, label: t.catalog.sortPriceAsc },
    { value: 4, label: t.catalog.sortPriceDesc },
  ];

  // Fetch Categories
  useEffect(() => {
    categoriesService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch Products based on Golden Rules 1 & 14
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const params: ProductFilterParams = {
          pageIndex,
          pageSize: 12,
          categoryId: selectedCategory,
          color: selectedColor || undefined,
          size: selectedSize || undefined,
          sortingOption: sortingOption || undefined,
          search: searchQuery || undefined,
        };

        const res = await productsService.getProducts(params);
        setProducts(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount || 0);

        if (res.data && res.data.length > 0) {
          trackViewItemList(
            res.data.map((p) => ({
              id: p.id,
              name: p.name,
              price: p.finalPrice ?? p.price,
              category: p.categoryName,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [pageIndex, selectedCategory, selectedColor, selectedSize, sortingOption, searchQuery]);

  const resetAllFilters = () => {
    setSelectedCategory(undefined);
    setSelectedColor('');
    setSelectedSize('');
    setSortingOption(0);
    setSearchQuery('');
    setPageIndex(1);
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedColor || selectedSize || sortingOption || searchQuery
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <ShimmerBadge icon={<Sparkles className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'التصاميم الملكية' : 'The Royal Catalog'}
        </ShimmerBadge>
        <h1 className="text-3xl sm:text-5xl font-serif font-light text-[var(--text-primary)]">
          {t.catalog.title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
          {t.catalog.subtitle}
        </p>
      </div>

      {/* Control Bar (Search, Active Chips, Layout Toggle, Mobile Filter Button) */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageIndex(1);
            }}
            placeholder={t.catalog.searchPlaceholder}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Sorting & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <select
              value={sortingOption}
              onChange={(e) => {
                setSortingOption(Number(e.target.value));
                setPageIndex(1);
              }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
            >
              {sortingOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid Layout Toggle (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 border border-[var(--border-subtle)] rounded-xl p-1 bg-[var(--bg-secondary)]">
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === 3 ? 'bg-[var(--accent-gold)] text-black' : 'text-[var(--text-secondary)]'
              }`}
              title="3 Columns"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === 4 ? 'bg-[var(--accent-gold)] text-black' : 'text-[var(--text-secondary)]'
              }`}
              title="4 Columns"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-gold)] text-black text-xs font-bold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.catalog.filterTitle}</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[var(--text-secondary)]">{t.catalog.showing}:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)]">
              {categories.find((c) => c.id === selectedCategory)?.name || 'Category'}
              <button onClick={() => setSelectedCategory(undefined)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedColor && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)]">
              {language === 'ar' ? `اللون: ${selectedColor}` : `Color: ${selectedColor}`}
              <button onClick={() => setSelectedColor('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSize && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)]">
              {language === 'ar' ? `المقاس: ${selectedSize}` : `Size: ${selectedSize}`}
              <button onClick={() => setSelectedSize('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-xs text-[var(--text-secondary)] hover:text-rose-400 underline ml-2"
          >
            {t.catalog.resetFilters}
          </button>
        </div>
      )}

      {/* Main Catalog Layout (Sidebar + Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sticky Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-28 space-y-6 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)]">
            <h3 className="font-serif text-lg font-light text-[var(--text-primary)]">
              {t.catalog.filterTitle}
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] text-[var(--accent-gold)] hover:underline"
              >
                {t.catalog.resetFilters}
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-3">
              {t.catalog.allCategories}
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex justify-between ${
                  !selectedCategory
                    ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{language === 'ar' ? 'الكل' : 'All Pieces'}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette Filter */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-3">
              {t.catalog.colorFilter}
            </h4>
            <div className="space-y-1.5">
              {availableColors.map((c) => (
                <button
                  key={c.query}
                  onClick={() => {
                    setSelectedColor(selectedColor === c.query ? '' : c.query);
                    setPageIndex(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedColor === c.query
                      ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{language === 'ar' ? c.nameAr : c.nameEn}</span>
                  {selectedColor === c.query && <span className="text-[var(--accent-gold)]">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Abaya Sizes Filter */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-3">
              {t.catalog.sizeFilter}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setSelectedSize(selectedSize === sz ? '' : sz);
                    setPageIndex(1);
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    selectedSize === sz
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black font-bold'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="aspect-[3/4] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shimmer-anim"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-10">
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-6 border-t border-[var(--border-subtle)]">
                  <button
                    disabled={pageIndex <= 1}
                    onClick={() => setPageIndex((p) => p - 1)}
                    className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs uppercase font-semibold text-[var(--text-secondary)] hover:border-[var(--accent-gold)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {language === 'ar' ? 'السابق' : 'Previous'}
                  </button>

                  <span className="text-xs text-[var(--text-secondary)]">
                    {language === 'ar'
                      ? `صفحة ${pageIndex} من ${totalPages}`
                      : `Page ${pageIndex} of ${totalPages}`}
                  </span>

                  <button
                    disabled={pageIndex >= totalPages}
                    onClick={() => setPageIndex((p) => p + 1)}
                    className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs uppercase font-semibold text-[var(--text-secondary)] hover:border-[var(--accent-gold)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {language === 'ar' ? 'التالي' : 'Next'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] space-y-4">
              <p className="font-serif text-lg text-[var(--text-primary)]">{t.catalog.noResults}</p>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                {t.catalog.tryAgain}
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 rounded-full bg-[var(--accent-gold)] text-black text-xs font-bold uppercase tracking-wider hover:bg-[var(--accent-bronze)] hover:text-white transition-colors"
              >
                {t.catalog.resetFilters}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer / Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-[var(--bg-surface)] h-full min-h-screen p-6 space-y-6 overflow-y-auto border-l border-[var(--border-subtle)]">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)]">
              <h3 className="font-serif text-lg font-light text-[var(--text-primary)]">
                {t.catalog.filterTitle}
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-3">
                {t.catalog.allCategories}
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory(undefined);
                    setPageIndex(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex justify-between ${
                    !selectedCategory
                      ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{language === 'ar' ? 'الكل' : 'All Pieces'}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPageIndex(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-3">
                {t.catalog.colorFilter}
              </h4>
              <div className="space-y-1.5">
                {availableColors.map((c) => (
                  <button
                    key={c.query}
                    onClick={() => {
                      setSelectedColor(selectedColor === c.query ? '' : c.query);
                      setPageIndex(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      selectedColor === c.query
                        ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{language === 'ar' ? c.nameAr : c.nameEn}</span>
                    {selectedColor === c.query && <span className="text-[var(--accent-gold)]">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-3">
                {t.catalog.sizeFilter}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setSelectedSize(selectedSize === sz ? '' : sz);
                      setPageIndex(1);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      selectedSize === sz
                        ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black font-bold'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-[var(--border-subtle)] flex gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-2 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:border-[var(--accent-gold)]"
              >
                {t.catalog.resetFilters}
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[var(--accent-gold)] text-black text-xs font-bold"
              >
                {language === 'ar' ? 'تطبيق' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading Haute Couture Catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
