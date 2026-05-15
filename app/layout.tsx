import type {Metadata} from 'next';
import { Inter, JetBrains_Mono, Geist } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EcoOps - Waste Recovery',
  description: 'CircularMetric Dashboard for Resource Recovery',
};

import { SettingsProvider } from '@/components/providers/SettingsProvider';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("dark", "antialiased", inter.variable, jetbrainsMono.variable, "font-sans", geist.variable)}>
      <body className="bg-background text-on-surface font-inter selection:bg-primary-container selection:text-on-primary-container" suppressHydrationWarning>
        <SettingsProvider>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
