'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingHeader() {
  return (
    <header className="bg-white/95 backdrop-blur-xs border-b border-line/70 sticky top-0 z-[1000]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand: Emblem + Clean Wordmark (No monospace, true high-contrast navy text on white) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 relative shrink-0">
            <Image
              src="/brand/meghsetu-emblem.png"
              alt="MeghSetu Emblem"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-tight text-navy-900 group-hover:text-brand-primary transition-colors leading-none">
              MeghSetu
            </span>
            <span className="text-[11px] text-ink-1 font-sans mt-1 leading-none">
              MoES · India Meteorological Department
            </span>
          </div>
        </Link>

        {/* Slim Nav: Simple, elegant text links (Analytics / Report / Admin) — No monospace, no dark navy-fill */}
        <nav className="flex items-center gap-6 sm:gap-8 font-sans text-sm font-medium">
          <Link
            href="/dashboard"
            className="text-ink-1 hover:text-navy-900 hover:text-brand-primary transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-brand-primary after:transition-all"
          >
            Analytics
          </Link>
          <Link
            href="/report"
            className="text-ink-1 hover:text-navy-900 hover:text-brand-primary transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-brand-primary after:transition-all"
          >
            Report
          </Link>
          <Link
            href="/admin"
            className="text-ink-1 hover:text-navy-900 hover:text-brand-primary transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-brand-primary after:transition-all"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
