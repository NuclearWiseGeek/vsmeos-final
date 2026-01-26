import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// IMPORT THESE TWO:
import { ESGProvider } from '@/context/ESGContext';
import AutoSave from '@/components/AutoSave'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VSME OS',
  description: 'Enterprise ESG Operating System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          
          {/* WRAP EVERYTHING IN PROVIDER */}
          <ESGProvider>
             {children}
             
             {/* ADD THE AUTO-SAVE COMPONENT HERE */}
             <AutoSave />
          </ESGProvider>
          
        </body>
      </html>
    </ClerkProvider>
  )
}