'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Clock } from 'lucide-react';
import { authService } from '@/api/auth';
import { parseApiError } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { translations } from '@/utils/translations';
import ShimmerBadge from '@/components/ui/ShimmerBadge';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';
  const isExpired = searchParams.get('expired') === 'true';

  const { setAuth } = useAuthStore();
  const { language } = useThemeStore();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    isExpired
      ? language === 'ar'
        ? 'انتهت جلستكِ لسلامة حسابكِ. يرجى تسجيل الدخول مجدداً.'
        : 'Your session has expired for security. Please sign in again.'
      : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await authService.login({ email: email.trim(), password });
      setAuth(res.token, {
        displayName: res.displayName,
        email: res.email,
      });
      router.push(redirectPath);
    } catch (err: unknown) {
      setErrorMsg(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('beshoy@example.com');
    setPassword('P@ssword123!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <ShimmerBadge icon={<Lock className="w-3.5 h-3.5" />}>
          {language === 'ar' ? 'بوابة الدار الخاصة' : 'Private Atelier Portal'}
        </ShimmerBadge>
        <h1 className="font-serif text-3xl font-light text-[var(--text-primary)]">
          {t.auth.loginTitle}
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
          {t.auth.loginSubtitle}
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6 shadow-xl">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@elegance.com"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-gold)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-bronze)] text-black font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : t.auth.signInBtn}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        {/* Demo Account Helper */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] text-[11px] font-semibold text-[var(--accent-gold)] transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.auth.demoCredentials}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
          <span>{t.auth.noAccount} </span>
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-[var(--accent-gold)] font-bold hover:underline"
          >
            {t.auth.registerBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading Atelier Portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
