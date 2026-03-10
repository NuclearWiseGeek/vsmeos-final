import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ESGProvider } from '@/context/ESGContext';
import AutoSave from '@/components/AutoSave';
import PageTransition from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VSME OS',
  description: 'Enterprise ESG Operating System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ESGProvider>
            {/* PageTransition wraps all children — every route change fades in */}
            <PageTransition>
              {children}
            </PageTransition>
            <AutoSave />
          </ESGProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}