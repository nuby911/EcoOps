'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Home, ScanLine, LineChart, Box, Award, Settings, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/scanner', label: 'Scan', icon: ScanLine },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-2 pb-safe glass h-[var(--spacing-bottom-nav-height)]">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center pt-2 pb-3 relative"
          >
            {isActive && (
              <div className="absolute top-0 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            )}
            <div className={clsx(
              "p-1.5 rounded-xl transition-all duration-300",
              isActive ? "text-primary" : "text-on-surface-variant"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className={clsx(
              "font-jetbrains text-[9px] uppercase tracking-tighter mt-1 transition-colors duration-300",
              isActive ? "text-primary font-bold" : "text-on-surface-variant/60"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
