import type { Metadata } from "next";
import "./globals.css";
import { ESGProvider } from "./context/ESGContext";

export const metadata: Metadata = {
  title: "VSMEOS - ESG Operating System",
  description: "Sustainability compliance for SMEs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <ESGProvider>
          {children}
        </ESGProvider>
      </body>
    </html>
  );
}