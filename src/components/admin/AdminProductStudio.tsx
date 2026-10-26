'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  Trash2,
  UploadCloud,
  Check,
  X,
  ArrowRight,
  Layers,
  Palette,
  Eye,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Category, Product } from '@/types/api';
import { imagesService } from '@/api/images';
import { productsService } from '@/api/products';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export interface ColorVariantState {
  id: string;
  colorName: string;
  images: string[];
  sizes: {
    size: string;
    stockQuantity: number;
    enabled: boolean;
  }[];
}

interface AdminProductStudioProps {
  categories: Category[];
  initialProduct?: Product | null;
  onCancel: () => void;
  onSuccess: () => void;
  showToast: (type: 'success' | 'error', text: string) => void;
}

const PRESET_ALPHA_SIZES = [
  { size: 'S', label: 'صغير (S)', defaultQty: 10 },
  { size: 'M', label: 'متوسط (M)', defaultQty: 15 },
  { size: 'L', label: 'كبير (L)', defaultQty: 15 },
  { size: 'XL', label: 'كبير جداً (XL)', defaultQty: 10 },
  { size: '2XL', label: 'مضاعف (2XL)', defaultQty: 5 },
];

const PRESET_FULL_ALPHA_SIZES = [
  { size: 'XS', label: 'XS', defaultQty: 5 },
  { size: 'S', label: 'S', defaultQty: 10 },
  { size: 'M', label: 'M', defaultQty: 15 },
  { size: 'L', label: 'L', defaultQty: 15 },
  { size: 'XL', label: 'XL', defaultQty: 10 },
  { size: '2XL', label: '2XL', defaultQty: 5 },
  { size: '3XL', label: '3XL', defaultQty: 5 },
];

const PRESET_FREE_SIZE = [
  { size: 'Free Size', label: 'مقاس موحد (Free Size)', defaultQty: 20 },
];

const QUICK_SIZE_OPTIONS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  'Free Size',
];

const QUICK_COLORS = [
  'أسود ملكي',
  'كحلي داكن',
  'بيج رملي',
  'زيتي فاخر',
  'عنابي ملكي',
  'بني شوكولاتة',
  'رمادي لؤلؤي',
];

export default function AdminProductStudio({
  categories,
  initialProduct,
  onCancel,
  onSuccess,
  showToast,
}: AdminProductStudioProps) {
  const isEditMode = Boolean(initialProduct);

  const getInitialColorVariants = (): ColorVariantState[] => {
    if (!initialProduct) {
      return [
        {
          id: 'color-1',
          colorName: 'أسود ملكي',
          images: [],
          sizes: PRESET_ALPHA_SIZES.map((s) => ({
            size: s.size,
            stockQuantity: s.defaultQty,
            enabled: true,
          })),
        },
      ];
    }

    if (initialProduct.colorGroups && initialProduct.colorGroups.length > 0) {
      return initialProduct.colorGroups.map((cg, idx) => ({
        id: `color-${idx + 1}`,
        colorName: cg.color,
        images: cg.images || [],
        sizes: cg.sizes.map((s) => ({
          size: s.size,
          stockQuantity: s.stockQuantity,
          enabled: true,
        })),
      }));
    }

    if (initialProduct.variants && initialProduct.variants.length > 0) {
      const map = new Map<string, ColorVariantState>();
      initialProduct.variants.forEach((v) => {
        const colorName = v.color || 'اللون الافتراضي';
        if (!map.has(colorName)) {
          map.set(colorName, {
            id: `color-${map.size + 1}`,
            colorName,
            images:
              v.images?.length > 0
                ? v.images
                : initialProduct.images?.length > 0
                ? initialProduct.images
                : initialProduct.pictureUrl
                ? [initialProduct.pictureUrl]
                : [],
            sizes: [],
          });
        }
        const entry = map.get(colorName)!;
        if (!entry.sizes.some((s) => s.size === v.size)) {
          entry.sizes.push({
            size: v.size,
            stockQuantity: v.stockQuantity,
            enabled: true,
          });
        }
      });
      if (map.size > 0) {
        return Array.from(map.values());
      }
    }

    return [
      {
        id: 'color-1',
        colorName: 'أسود ملكي',
        images:
          initialProduct.images?.length > 0
            ? initialProduct.images
            : initialProduct.pictureUrl
            ? [initialProduct.pictureUrl]
            : [],
        sizes: PRESET_ALPHA_SIZES.map((s) => ({
          size: s.size,
          stockQuantity: s.defaultQty,
          enabled: true,
        })),
      },
    ];
  };

  // 1. Basic Information
  const [name, setName] = useState(initialProduct?.name || '');
  const [categoryId, setCategoryId] = useState<number>(
    initialProduct?.categoryId || categories[0]?.id || 1
  );
  const [price, setPrice] = useState<string>(
    initialProduct?.price ? initialProduct.price.toString() : ''
  );
  const [description, setDescription] = useState(
    initialProduct?.description || ''
  );

  // 2. Colorways & Variants
  const [colorVariants, setColorVariants] = useState<ColorVariantState[]>(
    getInitialColorVariants()
  );

  const [activeColorId, setActiveColorId] = useState<string>('color-1');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customSizeQty, setCustomSizeQty] = useState('10');

  // Track newly uploaded images during this studio session (for Dropzone cancel/undo ❌ & cleanup)
  const [newSessionImages, setNewSessionImages] = useState<string[]>([]);
  // Set of image URLs currently being deleted from Cloudinary
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set());

  const activeVariant =
    colorVariants.find((c) => c.id === activeColorId) || colorVariants[0];

  // Helper to update active variant
  const updateActiveVariant = (updates: Partial<ColorVariantState>) => {
    setColorVariants((prev) =>
      prev.map((item) =>
        item.id === activeColorId ? { ...item, ...updates } : item
      )
    );
  };

  // Add a new color
  const handleAddColor = () => {
    const newId = `color-${Date.now()}`;
    const nextColorName =
      QUICK_COLORS.find(
        (qc) => !colorVariants.some((cv) => cv.colorName === qc)
      ) || `لون جديد ${colorVariants.length + 1}`;

    const newColor: ColorVariantState = {
      id: newId,
      colorName: nextColorName,
      images: [],
      sizes: activeVariant.sizes.map((s) => ({
        size: s.size,
        stockQuantity: s.stockQuantity,
        enabled: s.enabled,
      })),
    };

    setColorVariants((prev) => [...prev, newColor]);
    setActiveColorId(newId);
  };

  // Delete color
  const handleDeleteColor = (id: string) => {
    if (colorVariants.length <= 1) {
      showToast('error', 'يجب أن تحتوي القطعة على لون واحد على الأقل');
      return;
    }
    const remaining = colorVariants.filter((c) => c.id !== id);
    setColorVariants(remaining);
    if (activeColorId === id) {
      setActiveColorId(remaining[0].id);
    }
  };

  // Upload images for the active color
  const handleUploadImagesForActiveColor = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    try {
      setIsUploadingImage(true);
      const uploadedUrls = await imagesService.uploadMultipleImages(files);

      if (uploadedUrls.length > 0) {
        setNewSessionImages((prev) => [...prev, ...uploadedUrls]);
        updateActiveVariant({
          images: [...activeVariant.images, ...uploadedUrls],
        });
        showToast(
          'success',
          `تم رفع ${uploadedUrls.length} صور للون "${activeVariant.colorName}" بنجاح!`
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'تعذر رفع الصور، يرجى المحاولة مرة أخرى');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Remove an image from active color (deletes from Cloudinary via DELETE /api/Images/{publicId})
  const handleRemoveImageFromActiveColor = async (
    imgUrl: string,
    isUndoCancel: boolean = false
  ) => {
    try {
      setDeletingImages((prev) => new Set(prev).add(imgUrl));

      // 1. Remove from active variant state immediately for responsive UI
      updateActiveVariant({
        images: activeVariant.images.filter((url) => url !== imgUrl),
      });

      // 2. Remove from new session tracking
      setNewSessionImages((prev) => prev.filter((u) => u !== imgUrl));

      // 3. Delete from Cloudinary backend endpoint
      const wasDeleted = await imagesService.deleteImage(imgUrl);

      if (wasDeleted) {
        showToast(
          'success',
          isUndoCancel
            ? 'تم التراجع عن الرفع وحذف الصورة من Cloudinary بنجاح'
            : 'تم حذف الصورة من معرض القطعة وحذفها من Cloudinary بنجاح'
        );
      } else {
        showToast('success', 'تمت إزالة الصورة من المعرض');
      }
    } catch (err) {
      console.error('Error removing image:', err);
      showToast('error', 'تعذر حذف الصورة من السيرفر');
    } finally {
      setDeletingImages((prev) => {
        const next = new Set(prev);
        next.delete(imgUrl);
        return next;
      });
    }
  };

  // Cancel studio with automatic cleanup of unsaved session uploads
  const handleCancelStudio = () => {
    if (newSessionImages.length > 0) {
      const confirmDiscard = confirm(
        'هل تود التراجع وإغلاق المحرر؟ سيتم حذف الصور التي قمت برفعها مؤخراً لتنظيف التخزين في Cloudinary.'
      );
      if (!confirmDiscard) return;

      // Clean up orphaned images in background
      newSessionImages.forEach((imgUrl) => {
        imagesService.deleteImage(imgUrl).catch(console.error);
      });
    }
    onCancel();
  };

  // Toggle size active state
  const handleToggleSize = (sizeName: string) => {
    updateActiveVariant({
      sizes: activeVariant.sizes.map((s) =>
        s.size === sizeName ? { ...s, enabled: !s.enabled } : s
      ),
    });
  };

  // Change size stock quantity
  const handleUpdateStock = (sizeName: string, delta: number) => {
    updateActiveVariant({
      sizes: activeVariant.sizes.map((s) => {
        if (s.size === sizeName) {
          const nextVal = Math.max(0, s.stockQuantity + delta);
          return { ...s, stockQuantity: nextVal, enabled: true };
        }
        return s;
      }),
    });
  };

  const handleSetStockDirect = (sizeName: string, val: number) => {
    updateActiveVariant({
      sizes: activeVariant.sizes.map((s) =>
        s.size === sizeName
          ? { ...s, stockQuantity: Math.max(0, val), enabled: true }
          : s
      ),
    });
  };

  // Add custom size
  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSize = customSizeInput.trim();
    if (!cleanSize) {
      showToast('error', 'يرجى كتابة اسم المقاس أولاً');
      return;
    }
    if (
      activeVariant.sizes.some(
        (s) => s.size.toLowerCase() === cleanSize.toLowerCase()
      )
    ) {
      showToast('error', `المقاس "${cleanSize}" موجود بالفعل في هذا اللون`);
      return;
    }
    const parsedQty = parseInt(customSizeQty, 10);
    const validQty = !isNaN(parsedQty) && parsedQty >= 0 ? parsedQty : 10;

    updateActiveVariant({
      sizes: [
        ...activeVariant.sizes,
        { size: cleanSize, stockQuantity: validQty, enabled: true },
      ],
    });
    setCustomSizeInput('');
    showToast('success', `تمت إضافة مقاس "${cleanSize}" بنجاح`);
  };

  // Quick toggle / add from size chips
  const handleQuickToggleChip = (sizeName: string) => {
    const existingIndex = activeVariant.sizes.findIndex(
      (s) => s.size.toLowerCase() === sizeName.toLowerCase()
    );
    if (existingIndex >= 0) {
      const targetSize = activeVariant.sizes[existingIndex];
      handleToggleSize(targetSize.size);
    } else {
      updateActiveVariant({
        sizes: [
          ...activeVariant.sizes,
          { size: sizeName, stockQuantity: 10, enabled: true },
        ],
      });
      showToast('success', `تمت إضافة مقاس ${sizeName}`);
    }
  };

  // Remove a size from active color
  const handleRemoveSize = (sizeName: string) => {
    if (activeVariant.sizes.length <= 1) {
      showToast(
        'error',
        'يجب إبقاء مقاس واحد على الأقل، يمكنك تعطيله بدلاً من حذفه'
      );
      return;
    }
    updateActiveVariant({
      sizes: activeVariant.sizes.filter((s) => s.size !== sizeName),
    });
  };

  // Apply a preset template
  const handleApplyPreset = (presetType: 'alpha' | 'all-alpha' | 'free' | 'clear') => {
    if (presetType === 'clear') {
      updateActiveVariant({ sizes: [] });
      showToast('success', 'تم تفريغ قائمة المقاسات');
      return;
    }

    let targetPreset = PRESET_ALPHA_SIZES;
    let label = 'المقاسات الأساسية (S, M, L, XL, 2XL)';
    if (presetType === 'all-alpha') {
      targetPreset = PRESET_FULL_ALPHA_SIZES;
      label = 'كافة المقاسات (XS إلى 3XL)';
    } else if (presetType === 'free') {
      targetPreset = PRESET_FREE_SIZE;
      label = 'المقاس الموحد (Free Size)';
    }

    updateActiveVariant({
      sizes: targetPreset.map((s) => ({
        size: s.size,
        stockQuantity: s.defaultQty,
        enabled: true,
      })),
    });
    showToast('success', `تم تطبيق قالب ${label}`);
  };

  // Copy sizes of current color to all other colors
  const handleCopySizesToAllColors = () => {
    if (colorVariants.length <= 1) {
      showToast('error', 'يوجد لون واحد فقط حالياً');
      return;
    }
    setColorVariants((prev) =>
      prev.map((c) => ({
        ...c,
        sizes: activeVariant.sizes.map((s) => ({ ...s })),
      }))
    );
    showToast('success', 'تم نسخ ومزامنة المقاسات على جميع الألوان بنجاح');
  };

  // Toggle all sizes in active color
  const handleToggleAllSizes = (enable: boolean) => {
    updateActiveVariant({
      sizes: activeVariant.sizes.map((s) => ({ ...s, enabled: enable })),
    });
  };

  // Calculate metrics
  const totalVariantsCount = colorVariants.reduce(
    (acc, c) => acc + c.sizes.filter((s) => s.enabled).length,
    0
  );
  const totalStockCount = colorVariants.reduce(
    (acc, c) =>
      acc +
      c.sizes
        .filter((s) => s.enabled)
        .reduce((sum, s) => sum + (s.stockQuantity || 0), 0),
    0
  );
  const totalImagesCount = colorVariants.reduce(
    (acc, c) => acc + c.images.length,
    0
  );

  // Submit Product to Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('error', 'يرجى إدخال اسم العباية');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('error', 'يرجى إدخال سعر صحيح أكبر من الصفر');
      return;
    }
    if (!categoryId) {
      showToast('error', 'يرجى اختيار القسم');
      return;
    }

    // Validate colors
    for (const cv of colorVariants) {
      if (!cv.colorName.trim()) {
        showToast('error', 'يرجى ملء اسم جميع الألوان');
        return;
      }
      const enabledSizes = cv.sizes.filter((s) => s.enabled);
      if (enabledSizes.length === 0) {
        showToast(
          'error',
          `يرجى تفعيل مقاس واحد على الأقل للون "${cv.colorName}"`
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      // Collect all images across all colors
      const allImageUrls = Array.from(
        new Set(colorVariants.flatMap((c) => c.images))
      );

      // Construct Payload conforming strictly to backend CreateProductCommand DTO
      const payload: any = {
        name: name.trim(),
        description: description.trim() || name.trim(),
        price: parsedPrice,
        categoryId: Number(categoryId),
        colors: colorVariants.map((c) => ({
          color: c.colorName.trim(),
          sizes: c.sizes
            .filter((s) => s.enabled)
            .map((s) => ({
              size: s.size.trim(),
              stockQuantity: Math.max(0, s.stockQuantity || 0),
            })),
          ...(c.images.length > 0 ? { imageUrls: c.images } : {}),
        })),
      };

      if (allImageUrls.length > 0) {
        payload.imageUrl = allImageUrls[0];
        payload.imageUrls = allImageUrls;
      }

      if (isEditMode && initialProduct) {
        await productsService.updateProduct(initialProduct.id, payload);
        showToast('success', 'تم تعديل وتحديث بيانات القطعة بالكتالوج بنجاح!');
      } else {
        await productsService.createProduct(payload);
        showToast('success', 'تم حفظ ونشر القطعة الملكية بالكتالوج بنجاح!');
      }
      setNewSessionImages([]);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create product:', err);
      showToast(
        'error',
        err.response?.data?.message || 'تعذر إضافة القطعة، يرجى مراجعة البيانات'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Studio Header Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent-gold)] via-[var(--accent-bronze)] to-[var(--accent-gold)]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelStudio}
                className="px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة للكتالوج</span>
              </button>

              <ShimmerBadge icon={<Sparkles className="w-3.5 h-3.5" />}>
                استوديو الكوتور المتكامل (Product Studio)
              </ShimmerBadge>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[var(--text-primary)]">
              {isEditMode ? `تعديل قطعة كوتور: ${initialProduct?.name}` : 'إضافة قطعة عباية هوت كوتور جديدة'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {isEditMode
                ? `تحديث الأسعار والألوان والمقاسات والصور للقطعة رقم #${initialProduct?.id}`
                : 'إدارة احترافية متعددة الألوان: أضف ألواناً متعددة لنفس الموديل، مع رفع صور مخصصة لكل لون، وتحديد مقاسات ومخزون كل لون بشكل مستقل.'}
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2.5 sm:self-center">
            <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
              <span className="block text-[10px] text-[var(--text-secondary)] font-semibold uppercase">
                الألوان
              </span>
              <span className="text-sm font-bold text-[var(--accent-gold)] font-mono">
                {colorVariants.length}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
              <span className="block text-[10px] text-[var(--text-secondary)] font-semibold uppercase">
                الصور
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {totalImagesCount}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
              <span className="block text-[10px] text-[var(--text-secondary)] font-semibold uppercase">
                المتغيرات
              </span>
              <span className="text-sm font-bold text-amber-300 font-mono">
                {totalVariantsCount}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
              <span className="block text-[10px] text-[var(--text-secondary)] font-semibold uppercase">
                إجمالي القطع
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {totalStockCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ============================================================== */}
        {/* SECTION 1: ESSENTIAL DETAILS */}
        {/* ============================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-md">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
                البيانات الأساسية للموديل
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                اسم القطعة، السعر، القسم المناسب وتفاصيل الأقمشة الفاخرة.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Product Name */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                اسم العباية / الموديل *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: عباية ملكية كريب كوري بتطريز يدوي فاخر"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors"
              />
            </div>

            {/* Price */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                السعر بالجنيه (EGP) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 1450"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none font-mono transition-colors"
              />
            </div>

            {/* Category */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                قسم الكتالوج *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-12 space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                وصف الخامة، القصة والمناسبات (Description)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتبي تفاصيل خامة الكريب أو الحرير، نوع التطريز، القفلة (طقطق/لف)، وتعليمات الغسيل الملكية..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-2xl p-4 text-sm text-[var(--text-primary)] outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: MULTI-COLOR ATELIER & PER-COLOR GALLERIES */}
        {/* ============================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <span>تشكيلة ألوان الموديل وصور ومخزون كل لون</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]">
                    {colorVariants.length} ألوان
                  </span>
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  اضغط على أي لون لإدارته ورفع صوره الخاصة وضبط مقاساته بدقة.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddColor}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs flex items-center gap-2 hover:brightness-105 transition-all shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة لون جديد للعباية</span>
            </button>
          </div>

          {/* Color Tabs Switcher */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {colorVariants.map((c, index) => {
              const isActive = c.id === activeColorId;
              const enabledSizesCount = c.sizes.filter((s) => s.enabled).length;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveColorId(c.id)}
                  className={`cursor-pointer px-4 py-3 rounded-2xl border transition-all flex items-center gap-3 shrink-0 ${
                    isActive
                      ? 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)] text-[var(--accent-gold)] shadow-md'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-subtle)]/80 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border ${
                      isActive
                        ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]'
                        : 'border-zinc-500 bg-zinc-700'
                    }`}
                  />
                  <div>
                    <span className="block text-xs font-bold leading-tight">
                      {c.colorName || `لون #${index + 1}`}
                    </span>
                    <span className="block text-[10px] opacity-75 mt-0.5">
                      {c.images.length} صور • {enabledSizesCount} مقاسات
                    </span>
                  </div>

                  {colorVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteColor(c.id);
                      }}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                      title="حذف هذا اللون"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Color Details Box */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              {/* Color Name Input & Presets */}
              <div className="space-y-2 flex-1">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                  اسم اللون النشط (Active Color):
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    value={activeVariant.colorName}
                    onChange={(e) =>
                      updateActiveVariant({ colorName: e.target.value })
                    }
                    placeholder="مثال: أسود ملكي / كحلي كوتور"
                    className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] font-bold outline-none w-64"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      اقتراحات:
                    </span>
                    {QUICK_COLORS.map((qc) => (
                      <button
                        key={qc}
                        type="button"
                        onClick={() =>
                          updateActiveVariant({ colorName: qc })
                        }
                        className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                          activeVariant.colorName === qc
                            ? 'bg-[var(--accent-gold)] text-black font-bold border-[var(--accent-gold)]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white'
                        }`}
                      >
                        {qc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* A. DEDICATED IMAGE GALLERY FOR THIS COLOR */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>معرض صور لون "{activeVariant.colorName}" حصراً</span>
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    الصور المرفوعة هنا ستظهر للعميل فور اختياره هذا اللون تحديداً بالمتجر.
                  </p>
                </div>

                <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                  {activeVariant.images.length} صور مرفوعة
                </span>
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-gold)] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[var(--bg-surface)] group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUploadImagesForActiveColor}
                  disabled={isUploadingImage}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {isUploadingImage
                    ? 'جاري رفع الصور إلى Cloudinary عبر السيرفر...'
                    : `انقر لاختيار أو إسقاط صور لون "${activeVariant.colorName}" (يمكنك اختيار عدة صور معاً)`}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  JPG, PNG, WEBP — سيتم رفعها مباشرة لمجلد Cloudinary المخصص
                </p>
              </label>

              {/* Thumbnails Grid for this color */}
              {activeVariant.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {activeVariant.images.map((imgUrl, imgIndex) => {
                    const isCover = imgIndex === 0;
                    return (
                      <div
                        key={imgUrl}
                        className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border bg-black shadow-md ${
                          isCover
                            ? 'border-[var(--accent-gold)] ring-2 ring-[var(--accent-gold)]/30'
                            : 'border-[var(--border-subtle)]'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${activeVariant.colorName} - ${imgIndex + 1}`}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            deletingImages.has(imgUrl) ? 'opacity-30 scale-95' : 'group-hover:scale-105'
                          }`}
                        />

                        {/* Cover Badge */}
                        {isCover && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold bg-[var(--accent-gold)] text-black px-2 py-0.5 rounded-full shadow-md z-10">
                            الغلاف الرئيسي
                          </span>
                        )}

                        {/* Newly Uploaded Badge */}
                        {newSessionImages.includes(imgUrl) && !isCover && (
                          <span className="absolute top-2 right-2 text-[8px] font-medium bg-emerald-500/90 text-white px-1.5 py-0.5 rounded-full shadow-md z-10">
                            مرفوعة الآن
                          </span>
                        )}

                        {/* Deleting Spinner Overlay */}
                        {deletingImages.has(imgUrl) && (
                          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-2 z-20">
                            <div className="w-5 h-5 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mb-1" />
                            <span className="text-[9px] text-white font-medium">جارٍ الحذف...</span>
                          </div>
                        )}

                        {/* Overlay Controls */}
                        {!deletingImages.has(imgUrl) && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-2 z-10">
                            <div className="flex items-center gap-1.5 self-end">
                              {/* ❌ Undo Dropzone Upload Button (if newly uploaded in this session) */}
                              {newSessionImages.includes(imgUrl) && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageFromActiveColor(imgUrl, true)}
                                  className="p-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white hover:scale-110 transition-transform shadow-md"
                                  title="إلغاء الرفع والتراجع (حذف من Cloudinary)"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* 🗑️ Delete Image from Gallery & Cloudinary */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImageFromActiveColor(imgUrl, false)}
                                className="p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white hover:scale-110 transition-transform shadow-md"
                                title="حذف الصورة نهائياً من Cloudinary"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => {
                                  // Reorder so this image becomes cover
                                  const reordered = [
                                    imgUrl,
                                    ...activeVariant.images.filter((u) => u !== imgUrl),
                                  ];
                                  updateActiveVariant({ images: reordered });
                                }}
                                className="text-[9px] font-bold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-[var(--accent-gold)] hover:text-black transition-colors"
                              >
                                تعيين كغلاف
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* B. SIZES & STOCK MATRIX FOR THIS COLOR */}
            <div className="space-y-5 pt-6 border-t border-[var(--border-subtle)]">
              {/* Header with Title and Global Actions */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>مقاسات ومخزون لون "{activeVariant.colorName}"</span>
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    حددي المقاسات المتاحة لهذا اللون، اضبطي الكميات، أو أضيفي مقاسات مخصصة بسهولة.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {colorVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={handleCopySizesToAllColors}
                      className="px-3 py-1.5 rounded-xl bg-[var(--accent-gold)]/10 hover:bg-[var(--accent-gold)]/20 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="نسخ نفس هذه المقاسات والكميات لجميع ألوان هذا المنتج"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>نسخ لجميع الألوان</span>
                    </button>
                  )}

                  {activeVariant.sizes.length > 0 && (
                    <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => handleToggleAllSizes(true)}
                        className="px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        تحديد الكل
                      </button>
                      <span className="text-[var(--border-subtle)]">|</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAllSizes(false)}
                        className="px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        إلغاء التحديد
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 1. Quick Presets Bar */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)]/60 border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                    <span>قوالب مقاسات سريعة:</span>
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('alpha')}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent-gold)] hover:text-black border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all shadow-sm"
                    >
                      المقاسات الأساسية (S, M, L, XL, 2XL)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('all-alpha')}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent-gold)] hover:text-black border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all shadow-sm"
                    >
                      كافة المقاسات (XS إلى 3XL)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('free')}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent-gold)] hover:text-black border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all shadow-sm"
                    >
                      مقاس موحد (Free Size)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('clear')}
                      className="px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-xs text-[var(--text-secondary)] transition-colors"
                    >
                      تفريغ
                    </button>
                  </div>
                </div>

                {/* 2. Quick Clickable Chips */}
                <div className="pt-2 border-t border-[var(--border-subtle)]/60">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium ml-1">
                      إضافة سريعة بنقرة:
                    </span>
                    {QUICK_SIZE_OPTIONS.map((sz) => {
                      const addedItem = activeVariant.sizes.find(
                        (s) => s.size.toLowerCase() === sz.toLowerCase()
                      );
                      const isAdded = !!addedItem;
                      const isEnabled = addedItem?.enabled;

                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleQuickToggleChip(sz)}
                          className={`px-3 py-1 text-xs rounded-lg font-mono font-semibold transition-all flex items-center gap-1.5 ${
                            isAdded && isEnabled
                              ? 'bg-[var(--accent-gold)] text-black shadow-sm ring-1 ring-[var(--accent-gold)] font-bold'
                              : isAdded && !isEnabled
                              ? 'bg-[var(--bg-surface)] text-[var(--text-secondary)] line-through border border-dashed border-[var(--border-subtle)]'
                              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]'
                          }`}
                          title={
                            isAdded
                              ? isEnabled
                                ? `مقاس ${sz} مفعل - انقري للتعطيل`
                                : `مقاس ${sz} معطل - انقري للتفعيل`
                              : `انقري لإضافة مقاس ${sz}`
                          }
                        >
                          {isAdded && isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>{sz}</span>
                          {!isAdded && <span className="text-[10px] opacity-60">+</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Dedicated Custom Size Input Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-secondary)] border border-[var(--accent-gold)]/20 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center font-bold text-sm">
                      +
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] block">
                        كتابة مقاس مخصص
                      </span>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        اكتبي أي مقاس إضافي ترغبين به (مثل: L، XL، 3XL، مقاس أطفال، تفصيل خاص...)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <input
                      type="text"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                      placeholder="اكتبي المقاس هنا (مثل: L أو XL أو 4XL)..."
                      className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent-gold)] flex-1 sm:w-56 transition-all"
                    />

                    <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5">
                      <span className="text-[10px] text-[var(--text-secondary)]">الكمية:</span>
                      <input
                        type="number"
                        min="0"
                        value={customSizeQty}
                        onChange={(e) => setCustomSizeQty(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSize();
                          }
                        }}
                        className="w-14 bg-transparent text-center text-xs font-mono font-bold text-[var(--text-primary)] outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddCustomSize()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black text-xs font-bold hover:brightness-105 transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>إضافة المقاس</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Active Sizes Grid Cards */}
              {activeVariant.sizes.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)]/40">
                  <Layers className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    لا توجد مقاسات مضافة لهذا اللون حالياً
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    اختاري قالباً جاهزاً من الأعلى أو انقري على المقاسات السريعة أو اكتبي مقاساً مخصصاً.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {activeVariant.sizes.map((s) => (
                    <div
                      key={s.size}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        s.enabled
                          ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent-gold)]/40 shadow-sm'
                          : 'bg-[var(--bg-surface)]/40 border-transparent opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={s.enabled}
                            onChange={() => handleToggleSize(s.size)}
                            className="w-4 h-4 accent-[var(--accent-gold)] rounded cursor-pointer"
                          />
                          <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                            مقاس {s.size}
                          </span>
                        </label>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                              s.enabled && s.stockQuantity > 0
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {s.enabled
                              ? s.stockQuantity > 0
                                ? `${s.stockQuantity} متوفر`
                                : 'نفذ'
                              : 'معطل'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveSize(s.size)}
                            className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title={`حذف مقاس ${s.size}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {s.enabled && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateStock(s.size, -1)}
                            className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] flex items-center justify-center font-bold text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={s.stockQuantity}
                            onChange={(e) =>
                              handleSetStockDirect(
                                s.size,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg py-1 px-2 text-center text-xs font-mono font-bold text-[var(--text-primary)] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateStock(s.size, 1)}
                            className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] flex items-center justify-center font-bold text-sm"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 3: LUXURY ACTION BAR */}
        {/* ============================================================== */}
        <div className="sticky bottom-6 z-30 p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--accent-gold)]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                {isEditMode ? `تحديث القطعة #${initialProduct?.id}` : 'جاهز للنشر على متجر دار الأناقة'}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)]">
                {isEditMode
                  ? `سيتم حفظ التعديلات لـ ${totalVariantsCount} متغير ومزامنتها فوراً.`
                  : `سيتم توليد ${totalVariantsCount} متغير كوتور وحفظها في قاعدة البيانات السحابية فوراً.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCancelStudio}
              disabled={submitting}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-semibold"
            >
              إلغاء والعودة
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none px-8 py-3 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-xl shadow-[var(--accent-gold)]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? 'جاري حفظ التعديلات...' : 'جاري نشر القطعة بالمتجر...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isEditMode ? 'حفظ تعديلات القطعة الآن' : 'حفظ ونشر القطعة بالمتجر الآن'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
