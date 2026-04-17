// =============================================================================
// FILE: app/layout.tsx
// PURPOSE: Root layout — ClerkProvider + PageTransition.
//
// FONT: System font stack via Tailwind font-sans (no custom import).
//       The original codebase used system-ui — Geist was never part of the
//       design. font-sans resolves to: -apple-system, BlinkMacSystemFont,
//       "Segoe UI", Roboto, Helvetica Neue, Arial, sans-serif.
//
// RULES:
//   - No ESGProvider, no AutoSave, no supplier/buyer-specific code here.
//   - This file must stay a server component (no 'use client').
// =============================================================================

import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import PageTransition from '@/components/PageTransition';
import './globals.css';

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
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
          <PageTransition>
            {children}
          </PageTransition>
        </body>
      </html>
    </ClerkProvider>
  );
}