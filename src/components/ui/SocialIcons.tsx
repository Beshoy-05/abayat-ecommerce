'use client';

import React from 'react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { useThemeStore } from '@/store/useThemeStore';

// --- Individual Brand SVG Icons (24x24 pixel-perfect vectors) ---

export function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
    </svg>
  );
}

export function TwitterXIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SnapchatIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.75c-3.14 0-5.69 2.45-5.69 5.68 0 .82.16 1.63.45 2.37-.35.15-.81.42-.95.87-.07.21-.04.45.09.63.17.23.45.36.74.36.14 0 .3-.03.44-.1.1.55.4 1.03.85 1.38.08.06.17.12.27.17-.4.38-1.03.79-1.92 1.06-.33.1-.56.38-.57.72-.01.34.2.64.51.76.43.17 1.02.32 1.72.43.19.74.78 1.29 1.52 1.4.07.01.14.02.2.02.23 0 .46-.07.65-.2.4-.28.93-.43 1.47-.43s1.07.15 1.47.43c.19.13.42.2.65.2.07 0 .14-.01.2-.02.73-.11 1.33-.66 1.52-1.4.7-.11 1.29-.26 1.72-.43.32-.12.52-.42.51-.76-.01-.34-.24-.62-.57-.72-.89-.26-1.52-.67-1.92-1.06.09-.05.18-.11.27-.17.45-.35.75-.83.85-1.38.15.07.3.1.44.1.29 0 .57-.13.74-.36.13-.18.16-.42.09-.63-.14-.45-.6-.72-.95-.87.28-.74.45-1.55.45-2.37 0-3.23-2.55-5.68-5.69-5.68z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.49-.893-.795-1.496-1.777-1.671-2.077-.175-.3-.019-.462.13-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.584-.492-.505-.675-.514-.175-.009-.375-.009-.575-.009s-.525.075-.8.375c-.275.3-1.05 1.026-1.05 2.5 0 1.475 1.075 2.898 1.225 3.1.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.633.72.23 1.375.197 1.893.12.578-.087 1.78-.727 2.03-1.43.25-.703.25-1.306.175-1.43-.075-.125-.275-.2-.575-.35zM12.04 2C6.516 2 2.028 6.488 2.028 12.012c0 1.93.551 3.733 1.506 5.263L2.25 21.75l4.633-1.216c1.47.803 3.153 1.26 4.939 1.26 5.524 0 10.012-4.488 10.012-10.012C21.834 6.488 17.564 2 12.04 2z" />
    </svg>
  );
}

export function YouTubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// --- Props & Component for Full Links Row ---

export interface SocialMediaLinksProps {
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
  includeWhatsApp?: boolean;
}

export default function SocialMediaLinks({
  className = 'flex items-center gap-3 pt-5',
  buttonClassName = 'w-9 h-9 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 hover:shadow-[0_0_12px_rgba(212,175,55,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
  iconClassName = 'w-4 h-4',
  includeWhatsApp = false,
}: SocialMediaLinksProps) {
  const { settings } = useSiteSettingsStore();
  const { language } = useThemeStore();

  const links = [
    {
      key: 'instagram',
      url: settings.instagramUrl,
      title: 'Instagram',
      ariaLabel: language === 'ar' ? 'تابعنا على إنستغرام' : 'Follow us on Instagram',
      icon: <InstagramIcon className={iconClassName} />,
    },
    {
      key: 'tiktok',
      url: settings.tiktokUrl,
      title: 'TikTok',
      ariaLabel: language === 'ar' ? 'تابعنا على تيك توك' : 'Follow us on TikTok',
      icon: <TikTokIcon className={iconClassName} />,
    },
    {
      key: 'facebook',
      url: settings.facebookUrl,
      title: 'Facebook',
      ariaLabel: language === 'ar' ? 'تابعنا على فيسبوك' : 'Follow us on Facebook',
      icon: <FacebookIcon className={iconClassName} />,
    },
    {
      key: 'twitter',
      url: settings.twitterUrl,
      title: 'Twitter / X',
      ariaLabel: language === 'ar' ? 'تابعنا على إكس (تويتر)' : 'Follow us on X (Twitter)',
      icon: <TwitterXIcon className={iconClassName} />,
    },
    {
      key: 'snapchat',
      url: settings.snapchatUrl,
      title: 'Snapchat',
      ariaLabel: language === 'ar' ? 'تابعنا على سناب شات' : 'Follow us on Snapchat',
      icon: <SnapchatIcon className={iconClassName} />,
    },
  ];

  const activeLinks = links.filter((item) => Boolean(item.url));

  // Optional WhatsApp quick chat button in social row
  const whatsappNumber = settings.whatsappNumber;
  const whatsappUrl =
    includeWhatsApp && whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          language === 'ar'
            ? `مرحباً، أود الاستفسار عن تفصيل عباية فاخرة من ${settings.storeName || 'دار الأناقة'}.`
            : `Hello, I would like to inquire about a bespoke couture Abaya order.`
        )}`
      : null;

  if (activeLinks.length === 0 && !whatsappUrl) {
    return null;
  }

  return (
    <div className={className}>
      {activeLinks.map((item) => (
        <a
          key={item.key}
          href={item.url!}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName}
          title={item.title}
          aria-label={item.ariaLabel}
        >
          {item.icon}
        </a>
      ))}

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName}
          title="WhatsApp"
          aria-label={language === 'ar' ? 'محادثة عبر واتساب' : 'Chat on WhatsApp'}
        >
          <WhatsAppIcon className={iconClassName} />
        </a>
      )}
    </div>
  );
}
