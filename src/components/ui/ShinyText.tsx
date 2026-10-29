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
      className={`inline-block bg-[linear-gradient(110deg,#C5A880,45%,#ffffff,55%,#9E7A4A)] dark:bg-[linear-gradient(110deg,#E0B974,45%,#ffffff,55%,#C49746)] bg-[length:250%_100%] bg-clip-text text-transparent shiny-text-anim ${className}`}
    >
      {text}
    </span>
  );
}
