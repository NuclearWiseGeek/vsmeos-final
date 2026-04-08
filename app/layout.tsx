import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import PageTransition from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VSME OS — Carbon Compliance Infrastructure',
  description: 'Generate GHG Protocol-based carbon declarations for CSRD Scope 3 compliance. 69 countries, institutional-grade PDF reports, buyer-supplier marketplace.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'VSME OS — Carbon Compliance Infrastructure',
    description: 'Generate GHG Protocol-based carbon declarations for CSRD Scope 3 compliance.',
    siteName: 'VSME OS',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <PageTransition>
            {children}
          </PageTransition>
        </body>
      </html>
    </ClerkProvider>
  );
}