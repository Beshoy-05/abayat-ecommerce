'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  UploadCloud,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  QrCode,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { deliveryService } from '@/api/delivery';
import { ordersService } from '@/api/orders';
import { imagesService } from '@/api/images';
import { DeliveryMethod, CreateOrderPayload } from '@/types/api';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import { trackBeginCheckout, trackPurchase } from '@/utils/analytics';
import confetti from 'canvas-confetti';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, guestItems, getSubtotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { language, formatPrice } = useThemeStore();
  const t = translations[language];

  // Delivery methods from live API
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [selectedDeliveryMethodId, setSelectedDeliveryMethodId] = useState<number | undefined>(undefined);
  
  // Payment methods: InstaPay, Vodafone Cash, or Cash on Delivery
  const [paymentMethod, setPaymentMethod] = useState<'InstaPay' | 'VodafoneCash' | 'CashOnDelivery'>('InstaPay');

  // Form Fields - All Required (Governorate removed as instructed)
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [comments, setComments] = useState('');

  // Receipt screenshot state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Flow States
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);

  const items = isAuthenticated && cart?.items ? cart.items : guestItems;
  const subtotal = getSubtotal();

  useEffect(() => {
    deliveryService
      .getDeliveryMethods()
      .then((methods) => {
        setDeliveryMethods(methods);
        if (methods.length > 0) {
          setSelectedDeliveryMethodId(methods[0].id);
        }
      })
      .catch(console.error);

    if (items.length > 0) {
      trackBeginCheckout({
        total: subtotal,
        itemsCount: items.length,
        items: items.map((it) => ({
          variantId: it.productVariantId,
          name: it.productName,
          price: it.unitPrice,
          quantity: it.quantity,
        })),
      });
    }
  }, [items, subtotal]);

  const selectedDelivery = deliveryMethods.find((d) => d.id === selectedDeliveryMethodId);
  const deliveryCost = selectedDelivery ? selectedDelivery.cost : 0;
  const totalWithShipping = subtotal + deliveryCost;

  // Clipboard copy handler
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Upload receipt to Cloudinary via backend API
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const oldReceiptUrl = receiptUrl;

    try {
      setIsUploadingReceipt(true);
      setErrorMsg(null);
      setReceiptFile(file);
      const res = await imagesService.uploadImage(file);
      const newUrl = res.secureUrl || res.url;
      // Delete old receipt from Cloudinary if replacing
      if (oldReceiptUrl && oldReceiptUrl !== newUrl) {
        imagesService.deleteImage(oldReceiptUrl).catch(console.error);
      }
      setReceiptUrl(newUrl);
    } catch (err: any) {
      console.error('Receipt upload error:', err);
      setErrorMsg(
        language === 'ar'
          ? 'تعذر رفع صورة الإيصال. يرجى التأكد من حجم وصيغة الصورة وإعادة المحاولة.'
          : 'Failed to upload receipt screenshot. Please try again with a valid image.'
      );
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Step 1 Validation
  const handleProceedToCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim() || !streetAddress.trim()) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى إكمال جميع الحقول المطلوبة (الاسم، الهاتف، البريد، العنوان).'
          : 'Please complete all required fields (Name, Phone, Email, Address).'
      );
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  // Place Order Handler
  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !streetAddress.trim()) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى ملء كافة بيانات العميل والعنوان بالتفصيل.'
          : 'Please provide complete delivery and client details.'
      );
      setStep(1);
      return;
    }

    // Require receipt screenshot for InstaPay and Vodafone Cash transfers
    if ((paymentMethod === 'InstaPay' || paymentMethod === 'VodafoneCash') && !receiptUrl) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى رفع سكرين شوت إيصال التحويل لمراجعة الطلب والموافقة عليه من الإدارة.'
          : 'Please upload the payment transfer screenshot to verify your order.'
      );
      setStep(3);
      return;
    }

    if (!isAuthenticated) {
      setErrorMsg(
        language === 'ar'
          ? 'يرجى تسجيل الدخول أو إنشاء حساب لإتمام الطلب الملكي'
          : 'Please sign in or create an account to secure this bespoke order'
      );
      router.push('/login?redirect=/checkout');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Strict Golden Rule #2, #3, #4:
      // - items ONLY contain productVariantId & quantity (NO unitPrice!)
      // - NO customerId (server resolves from JWT ClaimTypes.NameIdentifier)
      const payload: CreateOrderPayload = {
        shippingAddress: `${streetAddress.trim()} | العميل: ${fullName.trim()} | الهاتف: ${phone.trim()}`,
        deliveryMethodId: selectedDeliveryMethodId,
        paymentMethod: paymentMethod,
        paymentReceiptUrl: receiptUrl || null,
        comments: comments.trim() || undefined,
        items: items.map((it) => ({
          productVariantId: it.productVariantId,
          quantity: it.quantity,
        })),
      };

      const orderId = await ordersService.createOrder(payload);
      setPlacedOrderId(orderId);

      // Confetti Celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#E0B974', '#C5A880', '#9E7A4A', '#FFFFFF'],
        });
      } catch {
        // ignore
      }

      // Track Purchase in DataLayer
      await trackPurchase({
        orderId,
        total: totalWithShipping,
        shipping: deliveryCost,
        customerEmail: email || user?.email,
        customerPhone: phone || user?.phoneNumber,
        items: items.map((it) => ({
          variantId: it.productVariantId,
          name: it.productName,
          price: it.unitPrice,
          quantity: it.quantity,
        })),
      });

      clearCart();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to confirm order with atelier. Please verify details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS ORDER SCREEN
  if (placedOrderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 flex items-center justify-center text-[var(--accent-gold)] shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <ShimmerBadge icon={<Sparkles className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'تم تقديم الطلب بنجاح' : 'Order Placed Successfully'}
        </ShimmerBadge>

        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {language === 'ar' ? 'تم استلام طلبكِ الملكي بنجاح' : 'Your Royal Order is Confirmed'}
        </h1>

        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-md mx-auto space-y-3 shadow-lg">
          <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
            {t.checkout.orderNumber}
          </p>
          <p className="font-serif text-3xl font-bold text-[var(--accent-gold)] tracking-widest">
            #{placedOrderId}
          </p>
          <div className="pt-2 text-xs text-[var(--text-secondary)] leading-relaxed space-y-1">
            <p>
              {language === 'ar'
                ? 'طلبكِ الآن قيد المراجعة لدى الإدارة. سيتم فحص إيصال التحويل واعتماد الطلب وخصم القطع من المخزون فوراً.'
                : 'Your order is currently under atelier review. The management will verify the payment receipt and confirm your order promptly.'}
            </p>
            {receiptUrl && (
              <p className="text-[var(--accent-gold)] font-medium pt-1">
                {language === 'ar' ? '✓ تم إرفاق سكرين شوت الإيصال بنجاح' : '✓ Transfer receipt uploaded'}
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-widest hover:brightness-105 transition-all shadow-lg"
          >
            {t.checkout.viewOrder}
          </Link>
          <Link
            href="/shop"
            className="px-8 py-3.5 rounded-full border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] text-xs uppercase tracking-widest font-semibold transition-all"
          >
            {t.cart.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-4">
        <h2 className="font-serif text-2xl text-[var(--text-primary)]">{t.cart.empty}</h2>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 rounded-full bg-[var(--accent-gold)] text-black text-xs font-bold uppercase tracking-wider"
        >
          {t.cart.explore}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <ShimmerBadge icon={<Lock className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'إتمام الشراء الآمن' : 'Haute Couture Checkout'}
        </ShimmerBadge>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[var(--text-primary)]">
          {t.checkout.title}
        </h1>
      </div>

      {/* Progress Steps Header */}
      <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2 text-center text-xs">
        {[
          { num: 1, label: language === 'ar' ? 'بيانات التوصيل' : 'Delivery Details' },
          { num: 2, label: language === 'ar' ? 'طريقة الشحن' : 'Courier' },
          { num: 3, label: language === 'ar' ? 'طريقة الدفع والإيصال' : 'Payment & Receipt' },
          { num: 4, label: language === 'ar' ? 'مراجعة وتأكيد' : 'Confirmation' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num as 1 | 2 | 3 | 4)}
            className={`pb-2 border-b-2 transition-all ${
              step >= s.num
                ? 'border-[var(--accent-gold)] text-[var(--accent-gold)] font-bold'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            <span className="block truncate">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Form: Multi-step process */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Address & Details (ALL REQUIRED, GOVERNORATE REMOVED) */}
          {step === 1 && (
            <form onSubmit={handleProceedToCourier} className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
              <h2 className="font-serif text-xl font-light text-[var(--text-primary)] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[var(--accent-gold)]" />
                <span>{language === 'ar' ? 'بيانات التوصيل والعنوان' : 'Delivery Details'}</span>
              </h2>

              {!isAuthenticated && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                  {language === 'ar'
                    ? 'نصيحة: سجلي دخولكِ للاحتفاظ بعنوانكِ ومتابعة حالة طلبكِ بسهولة.'
                    : 'Tip: Please sign in to link this order to your private atelier profile.'}{' '}
                  <Link href="/login?redirect=/checkout" className="underline font-bold text-amber-200">
                    {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                    {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'ar' ? 'سارة محمود' : 'Sarah Mahmoud'}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@elegance.eg"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                  {language === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                  {language === 'ar' ? 'العنوان بالتفصيل (الشارع، المنطقة، رقم المبنى والشقة)' : 'Detailed Address (Street, District, Building/Apartment)'} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: شارع 26 يوليو، الزمالك، عمارة 12، الدور الرابع، شقة 8' : 'e.g. 26th of July St, Zamalek, Bldg 12, Apt 8'}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
                  {language === 'ar' ? 'ملاحظات إضافية للتوصيل (اختياري)' : 'Delivery Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: يرجى الاتصال قبل الوصول بنصف ساعة' : 'e.g. Call 30 mins before arrival'}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent-bronze)] hover:text-white transition-colors"
              >
                {language === 'ar' ? 'المتابعة لاختيار شركة الشحن ←' : 'Continue to Courier Method →'}
              </button>
            </form>
          )}

          {/* STEP 2: Courier Method */}
          {step === 2 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
              <h2 className="font-serif text-xl font-light text-[var(--text-primary)] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[var(--accent-gold)]" />
                <span>{language === 'ar' ? 'طريقة الشحن والتوصيل' : 'Courier Method'}</span>
              </h2>

              <div className="space-y-3">
                {deliveryMethods.map((dm) => (
                  <label
                    key={dm.id}
                    onClick={() => setSelectedDeliveryMethodId(dm.id)}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedDeliveryMethodId === dm.id
                        ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 shadow-md'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-gold)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedDeliveryMethodId === dm.id}
                        onChange={() => setSelectedDeliveryMethodId(dm.id)}
                        className="text-[var(--accent-gold)] focus:ring-[var(--accent-gold)]"
                      />
                      <div>
                        <h4 className="font-semibold text-xs text-[var(--text-primary)]">
                          {dm.shortName}
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)]">{dm.description}</p>
                        <span className="text-[10px] text-[var(--accent-gold)] font-bold">
                          {dm.deliveryTime}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif text-sm font-bold text-[var(--accent-gold)]">
                      {dm.cost === 0 ? (language === 'ar' ? 'مجاني' : 'FREE') : formatPrice(dm.cost)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-full border border-[var(--border-subtle)] text-xs uppercase font-semibold text-[var(--text-secondary)]"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent-bronze)] hover:text-white transition-colors"
                >
                  {language === 'ar' ? 'المتابعة لبيانات الدفع ←' : 'Continue to Payment →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method (InstaPay & Vodafone Cash with Receipt Upload) */}
          {step === 3 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-sm">
              <h2 className="font-serif text-xl font-light text-[var(--text-primary)] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[var(--accent-gold)]" />
                <span>{language === 'ar' ? 'طرق الدفع وإرفاق الإيصال' : 'Payment & Transfer Receipt'}</span>
              </h2>

              {/* Payment Methods Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. INSTAPAY */}
                <div
                  onClick={() => setPaymentMethod('InstaPay')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'InstaPay'
                      ? 'border-purple-500 bg-purple-500/10 shadow-md ring-1 ring-purple-500'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[var(--text-primary)]">إنستاباي (InstaPay)</span>
                    <Smartphone className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-[10px] text-purple-400 font-medium">Powered by InstaPay</span>
                </div>

                {/* 2. VODAFONE CASH */}
                <div
                  onClick={() => setPaymentMethod('VodafoneCash')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'VodafoneCash'
                      ? 'border-rose-500 bg-rose-500/10 shadow-md ring-1 ring-rose-500'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-rose-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[var(--text-primary)]">فودافون كاش</span>
                    <Smartphone className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-[10px] text-rose-400">Vodafone Cash</span>
                </div>

                {/* 3. CASH ON DELIVERY */}
                <div
                  onClick={() => setPaymentMethod('CashOnDelivery')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'CashOnDelivery'
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 shadow-md ring-1 ring-[var(--accent-gold)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent-gold)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[var(--text-primary)]">عند الاستلام</span>
                    <Banknote className="w-4 h-4 text-[var(--accent-gold)]" />
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)]">Cash on Delivery</span>
                </div>
              </div>

              {/* PAYMENT DETAILS BOX */}
              {paymentMethod === 'InstaPay' && (
                <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                        الدفع عبر تطبيق إنستاباي (InstaPay)
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        المبلغ المطلوب تحويله: <span className="font-bold text-purple-400">{formatPrice(totalWithShipping)}</span>
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30">
                      Powered by InstaPay
                    </span>
                  </div>

                  {/* InstaPay IPA */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold">
                        عنوان الدفع اللحظي (IPA)
                      </p>
                      <p className="font-mono text-xs font-bold text-[var(--text-primary)] mt-0.5">
                        awadallaalashkar@instapay
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('awadallaalashkar@instapay', 'ipa')}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-purple-500/30"
                    >
                      {copiedText === 'ipa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'ipa' ? 'تم النسخ' : 'نسخ العنوان'}</span>
                    </button>
                  </div>

                  {/* Direct Link */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-purple-500/15 via-purple-500/5 to-transparent border border-purple-500/30">
                    <div className="text-xs text-[var(--text-primary)]">
                      <p className="font-medium">اضغط الرابط لإرسال نقود إلى awadallaalashkar@instapay مباشرة</p>
                    </div>
                    <a
                      href="https://ipn.eg/S/awadallaalashkar/instapay/0XKAPo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-[#792474] hover:from-purple-500 hover:to-[#8e2b88] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shrink-0 shadow-purple-950/40 hover:brightness-110"
                    >
                      <span>افتح إنستاباي للدفع</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {paymentMethod === 'VodafoneCash' && (
                <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-rose-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                        الدفع عبر محفظة فودافون كاش
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        المبلغ المطلوب تحويله: <span className="font-bold text-[var(--accent-gold)]">{formatPrice(totalWithShipping)}</span>
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      Vodafone Cash
                    </span>
                  </div>

                  {/* Vodafone Cash Number */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold">
                        رقم محفظة فودافون كاش
                      </p>
                      <p className="font-mono text-sm font-bold text-[var(--text-primary)] mt-0.5 tracking-wider">
                        +20 10 96212029 (01096212029)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01096212029', 'voda')}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedText === 'voda' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'voda' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    قم بتحويل المبلغ الإجمالي إلى الرقم أعلاه عبر كود <span className="font-mono text-[var(--accent-gold)] font-bold">*9*7*الرقم*المبلغ#</span> أو تطبيق Ana Vodafone، ثم التقط سكرين شوت لرسالة تأكيد التحويل وارفعها بالأسفل.
                  </p>
                </div>
              )}

              {paymentMethod === 'CashOnDelivery' && (
                <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                  <h4 className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                    الدفع عند الاستلام نقداً
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    ستقومين بدفع المبلغ نقداً لمندوب الشحن عند استلام وفحص عبايتكِ الفاخرة. يمكنكِ أيضاً إرفاق صورة البطاقة أو أي تأكيد إذا رغبتِ.
                  </p>
                </div>
              )}

              {/* 📸 MANDATORY RECEIPT SCREENSHOT UPLOAD */}
              <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--accent-gold)]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-[var(--accent-gold)]" />
                      <span>{language === 'ar' ? 'رفع سكرين شوت إيصال التحويل' : 'Upload Payment Receipt Screenshot'}</span>
                      <span className="text-rose-500">*</span>
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {language === 'ar'
                        ? 'مطلوب: ارفعي سكرينة تأكيد التحويل ليقوم الأدمن بفحصها واعتماد طلبكِ وخصم القطع من المخزون.'
                        : 'Required: Upload your transfer confirmation screenshot for the admin to review and deduct inventory.'}
                    </p>
                  </div>
                </div>

                {/* Upload Area / Preview */}
                {!receiptUrl ? (
                  <label className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-gold)] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[var(--bg-surface)] group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      disabled={isUploadingReceipt}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      {isUploadingReceipt ? (
                        <div className="w-5 h-5 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {isUploadingReceipt
                        ? (language === 'ar' ? 'جاري رفع صورة الإيصال...' : 'Uploading receipt...')
                        : (language === 'ar' ? 'انقري هنا لاختيار صورة الإيصال أو اسحبيها' : 'Click to select receipt screenshot or drag & drop')}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">PNG, JPG, WEBP (Max 10MB)</p>
                  </label>
                ) : (
                  <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-emerald-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-[var(--border-subtle)] relative shrink-0">
                        <img
                          src={receiptUrl}
                          alt="Receipt Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{language === 'ar' ? 'تم رفع الإيصال بنجاح' : 'Receipt uploaded successfully'}</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 truncate max-w-[200px] sm:max-w-[300px]">
                          {receiptFile?.name || 'receipt_screenshot.png'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <label className="text-[11px] font-semibold text-[var(--accent-gold)] hover:underline cursor-pointer shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="hidden"
                        />
                        {language === 'ar' ? 'تغيير الصورة' : 'Change Image'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (receiptUrl) {
                            imagesService.deleteImage(receiptUrl).catch(console.error);
                          }
                          setReceiptUrl('');
                          setReceiptFile(null);
                        }}
                        className="p-1 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors"
                        title={language === 'ar' ? 'حذف الإيصال' : 'Delete Receipt'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-full border border-[var(--border-subtle)] text-xs uppercase font-semibold text-[var(--text-secondary)]"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if ((paymentMethod === 'InstaPay' || paymentMethod === 'VodafoneCash') && !receiptUrl) {
                      setErrorMsg(
                        language === 'ar'
                          ? 'يرجى رفع سكرين شوت إيصال التحويل أولاً للمتابعة.'
                          : 'Please upload the payment transfer screenshot first to proceed.'
                      );
                      return;
                    }
                    setErrorMsg(null);
                    setStep(4);
                  }}
                  className="flex-1 py-3.5 rounded-full bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent-bronze)] hover:text-white transition-colors"
                >
                  {language === 'ar' ? 'مراجعة وتأكيد الطلب ←' : 'Review Order →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation & Place Order */}
          {step === 4 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-sm">
              <h2 className="font-serif text-xl font-light text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--accent-gold)]" />
                <span>{language === 'ar' ? 'مراجعة وتأكيد الطلب الملكي' : 'Review & Place Order'}</span>
              </h2>

              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{language === 'ar' ? 'اسم العميل:' : 'Client:'}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{fullName || user?.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{phone || user?.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{language === 'ar' ? 'عنوان التوصيل:' : 'Address:'}</span>
                  <span className="font-semibold text-[var(--text-primary)] text-right">{streetAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{language === 'ar' ? 'شركة الشحن:' : 'Courier:'}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{selectedDelivery?.shortName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{language === 'ar' ? 'طريقة الدفع:' : 'Payment:'}</span>
                  <span className={`font-semibold ${
                    paymentMethod === 'InstaPay'
                      ? 'text-purple-400'
                      : paymentMethod === 'VodafoneCash'
                      ? 'text-rose-400'
                      : 'text-[var(--accent-gold)]'
                  }`}>
                    {paymentMethod === 'InstaPay'
                      ? 'إنستاباي (InstaPay)'
                      : paymentMethod === 'VodafoneCash'
                      ? 'فودافون كاش (Vodafone Cash)'
                      : 'الدفع عند الاستلام'}
                  </span>
                </div>
                {receiptUrl && (
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">{language === 'ar' ? 'سكرينة الإيصال:' : 'Receipt:'}</span>
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--accent-gold)] underline font-medium flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'عرض السكرين شوت المرفقة' : 'View Uploaded Screenshot'}</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-full border border-[var(--border-subtle)] text-xs uppercase font-semibold text-[var(--text-secondary)]"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="flex-1 py-4 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? (language === 'ar' ? 'جاري إرسال الطلب...' : 'Placing Order...') : (language === 'ar' ? 'تأكيد وإرسال الطلب للدار' : 'Confirm & Place Order')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-xl sticky top-28">
          <h3 className="font-serif text-xl font-light text-[var(--text-primary)] pb-4 border-b border-[var(--border-subtle)]">
            {language === 'ar' ? 'محتويات الحقيبة الملكية' : 'Your Order Items'}
          </h3>

          <div className="max-h-72 overflow-y-auto space-y-3 divide-y divide-[var(--border-subtle)]">
            {items.map((it) => (
              <div key={it.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-serif font-medium text-[var(--text-primary)] line-clamp-1">
                    {it.productName}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {it.color} / Size {it.size} × {it.quantity}
                  </p>
                </div>
                <span className="font-semibold text-[var(--accent-gold)]">
                  {formatPrice(it.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)] text-xs">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>{t.cart.subtotal}</span>
              <span className="font-medium text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>{language === 'ar' ? 'رسوم الشحن والتوصيل' : 'Courier Fee'}</span>
              <span className="font-medium text-[var(--text-primary)]">
                {deliveryCost === 0 ? (language === 'ar' ? 'مجاني' : 'FREE') : formatPrice(deliveryCost)}
              </span>
            </div>
            <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-baseline">
              <span className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                {language === 'ar' ? 'المجموع النهائي' : 'Order Total'}
              </span>
              <span className="font-serif text-2xl font-bold text-[var(--accent-gold)]">
                {formatPrice(totalWithShipping)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
