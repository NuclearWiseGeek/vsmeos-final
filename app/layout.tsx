import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ESGProvider } from "./context/ESGContext";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VSME ESG OS",
  description: "Automated Carbon Footprint for French Suppliers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ESGProvider>
            {children}
          </ESGProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}