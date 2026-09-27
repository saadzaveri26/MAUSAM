'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BarChart3, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Analytics Dashboard', icon: BarChart3 },
    { href: '/report', label: 'Submit Weather Report', icon: FileSpreadsheet },
    { href: '/admin', label: 'Admin Verification', icon: ShieldCheck },
  ];

  return (
    <header className="bg-navy-900 border-b border-navy-800 sticky top-0 z-[1000] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-white border border-navy-700 flex items-center justify-center p-1 group-hover:border-brand-primary transition-colors shadow-sm overflow-hidden">
            <Image
              src="/brand/meghsetu-emblem.png"
              alt="MeghSetu Emblem"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-white block leading-none">
              MeghSetu
            </span>
            <span className="text-[10px] text-slate-300 font-sans block mt-0.5">
              MoES · India Meteorological Department
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white border border-brand-primary/80 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-primary' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
