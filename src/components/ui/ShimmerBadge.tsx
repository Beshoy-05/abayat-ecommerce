'use client';

import React from 'react';

interface ShimmerBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function ShimmerBadge({ children, icon, className = '' }: ShimmerBadgeProps) {
  return (
    <div
      suppressHydrationWarning
      className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 lg:bg-[var(--bg-surface)]/70 lg:backdrop-blur-md text-[var(--accent-gold)] shadow-sm ${className}`}
    >
      <div className="absolute inset-0 shimmer-anim opacity-40 pointer-events-none" />
      {icon && <span className="text-[var(--accent-gold)]">{icon}</span>}
      <span className="relative z-10 font-semibold" suppressHydrationWarning>{children}</span>
    </div>
  );
}
