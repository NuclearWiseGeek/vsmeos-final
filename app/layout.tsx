// =============================================================================
// FILE: app/layout.tsx
// PURPOSE: Root layout — ClerkProvider + PageTransition.
//
// FONT: Inter (variable font) via next/font/google.
//       Variable font = one file covers all weights 100–900.
//       Closest web equivalent to Apple SF Pro.
// =============================================================================

import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import PageTransition from '@/components/PageTransition';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VSME OS — Supply Chain Carbon Intelligence',
  description:
    'VSME OS helps buyers collect Scope 3 carbon data from suppliers for CSRD compliance. ' +
    'Suppliers generate GHG Protocol-based PDF declarations in 15–30 minutes.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vsmeos.fr'),
  openGraph: {
    title: 'VSME OS — Supply Chain Carbon Intelligence',
    description:
      'Scope 3 carbon data collection for CSRD compliance. GHG Protocol-based reports in 15–30 minutes.',
    url: 'https://vsmeos.fr',
    siteName: 'VSME OS',
    locale: 'en_US',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0C2918',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body className="antialiased font-inter">
          <PageTransition>
            {children}
          </PageTransition>
        </body>
      </html>
    </ClerkProvider>
  );
}