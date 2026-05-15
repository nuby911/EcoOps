'use client';

import React from 'react';
import { Sidebar } from '../navigation/Sidebar';
import { MobileHeader } from '../navigation/MobileHeader';
import { MobileBottomNav } from '../navigation/MobileBottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 w-full pt-4 pb-[calc(var(--spacing-bottom-nav-height)+16px)] md:pt-8 md:pb-8 md:pl-72 md:pr-container-padding max-w-[1440px] mx-auto min-h-screen">
        <div className="w-full px-margin-mobile md:px-0">
          {children}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
