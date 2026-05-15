'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { 
  Leaf, 
  LayoutDashboard, 
  Box, 
  Scan, 
  BarChart2, 
  Award, 
  Plus, 
  HelpCircle,
  Settings,
  User
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Box },
  { href: '/scanner', label: 'Scanner', icon: Scan },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/badges', label: 'Badges', icon: Award },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen p-inner-padding bg-surface-container border-r border-[#262626] w-64 z-40">
      <div className="mb-8 flex items-center gap-3 px-2">
        <Leaf className="text-primary w-8 h-8 flex-shrink-0" fill="currentColor" />
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight leading-none">EcoOps</h1>
          <p className="font-jetbrains text-[10px] uppercase tracking-wider text-on-surface-variant mt-1.5">Waste Recovery</p>
        </div>
      </div>
      
      <button className="w-full bg-primary-container text-[#0A0A0A] font-semibold py-3 rounded-lg mb-8 hover:bg-primary transition-colors flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />
        Log Waste
      </button>
      
      <div className="flex-1 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group font-jetbrains text-xs uppercase tracking-wide',
                isActive 
                  ? 'bg-primary-container text-on-primary-container font-semibold' 
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary translate-x-1 duration-200'
              )}
            >
              <Icon 
                className={clsx(
                  'w-5 h-5 transition-colors',
                  isActive ? '' : 'group-hover:text-primary'
                )} 
              />
              {item.label}
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto pt-4 border-t border-[#262626] flex flex-col gap-2">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-all font-jetbrains text-xs uppercase tracking-wide group"
        >
          <HelpCircle className="w-5 h-5 group-hover:text-primary transition-colors" />
          Support
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error/10 hover:text-error transition-all font-jetbrains text-xs uppercase tracking-wide group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Log Out
          </button>
        </form>
      </div>
    </nav>
  );
}
