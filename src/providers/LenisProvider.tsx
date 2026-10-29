'use client';

import React, { useEffect } from 'react';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Skip Lenis completely on touch/mobile devices for native 60/120Hz scrolling & zero JS download
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024);
    if (isTouch) {
      return;
    }

    let rafId = 0;
    let destroyed = false;
    let lenisInstance: { raf: (time: number) => void; destroy: () => void } | null = null;

    import('lenis').then(({ default: Lenis }) => {
      if (destroyed) return;
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
      });
      lenisInstance = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      destroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      lenisInstance?.destroy();
    };
  }, []);

  return <>{children}</>;
}
