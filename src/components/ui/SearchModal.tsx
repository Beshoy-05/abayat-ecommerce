'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { productsService } from '@/api/products';
import { Product } from '@/types/api';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { language, formatPrice } = useThemeStore();
  const t = translations[language];

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-search-modal', handleOpen);
    return () => window.removeEventListener('open-search-modal', handleOpen);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await productsService.getProducts({ search: query.trim(), pageSize: 6 });
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const quickTags = [
    { labelEn: 'Royal Black', labelAr: 'أسود ملكي', query: 'أسود ملكي' },
    { labelEn: 'Pure Silk', labelAr: 'حرير خالص', query: 'Silk' },
    { labelEn: 'Luxury Occasion', labelAr: 'عبايات مناسبات', query: 'Occasion' },
    { labelEn: 'Beige & Sand', labelAr: 'بيج رملي', query: 'بيج رملي' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative max-w-2xl mx-auto rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center gap-3">
              <Search className="w-5 h-5 text-[var(--accent-gold)]" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.catalog.searchPlaceholder}
                className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 text-base focus:outline-none font-serif"
              />
              {loading && <Loader2 className="w-5 h-5 text-[var(--accent-gold)] animate-spin" />}
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--accent-gold)]"
              >
                Esc
              </button>
            </div>

            {/* Quick Search Chips */}
            <div className="px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[var(--text-secondary)] uppercase tracking-wider text-[10px] font-semibold">
                {language === 'ar' ? 'البحث السريع:' : 'Quick Filter:'}
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag.query}
                  onClick={() => setQuery(tag.query)}
                  className="px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors whitespace-nowrap"
                >
                  {language === 'ar' ? tag.labelAr : tag.labelEn}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-3">
              {results.length > 0 ? (
                results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors group border border-transparent hover:border-[var(--border-subtle)]"
                  >
                    <div className="w-14 h-16 rounded-lg bg-[var(--bg-primary)] overflow-hidden relative flex-shrink-0" style={{ position: 'relative' }}>
                      <Image
                        src={product.pictureUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&q=80'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {product.categoryName || 'Haute Couture'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-sm text-[var(--accent-gold)]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </Link>
                ))
              ) : query && !loading ? (
                <div className="text-center py-10 text-[var(--text-secondary)] text-sm">
                  {t.catalog.noResults}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-secondary)]">
                  {language === 'ar'
                    ? 'اكتشفي عبايات الهوت كوتور والحرير الملكي في المشغل'
                    : 'Search our atelier catalog by fabric, color, or silhouette'}
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] text-center">
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-gold)] font-semibold uppercase tracking-wider hover:underline"
                >
                  <span>{language === 'ar' ? 'عرض جميع النتائج' : 'View all matching pieces'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
