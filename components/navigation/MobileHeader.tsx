'use client';

import React from 'react';
import { Bell, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-background border-b border-border-bento">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-primary tracking-tight">CircularMetric</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors scale-95 active:duration-100">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors scale-95 active:duration-100">
          <Settings className="w-5 h-5" />
        </button>
        <Link href="/profile" className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-border-bento block">
          <Image 
            src="https://picsum.photos/seed/manager1/100/100" 
            alt="Manager Profile" 
            width={32} 
            height={32} 
            className="w-full h-full object-cover grayscale"
            unoptimized
          />
        </Link>
      </div>
    </header>
  );
}
