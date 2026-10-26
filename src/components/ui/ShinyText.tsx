'use client';

import React from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
}

export default function ShinyText({ text, className = '' }: ShinyTextProps) {
  return (
    <span
      suppressHydrationWarning
      className={`inline-block bg-[linear-gradient(110deg,#C5A880,45%,#ffffff,55%,#9E7A4A)] dark:bg-[linear-gradient(110deg,#E0B974,45%,#ffffff,55%,#C49746)] bg-[length:250%_100%] bg-clip-text text-transparent animate-shiny-text ${className}`}
      style={{
        animation: 'shine 3.5s infinite linear',
      }}
    >
      {text}
      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </span>
  );
}
