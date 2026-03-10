// =============================================================================
// FILE: components/SharedNav.tsx
// PURPOSE: Unified navigation bar for all public-facing pages:
//          /methodology, /framework, /alignment, /privacy, /terms
//
//          Replaces the 5 different ad-hoc headers those pages had before.
//          Keeps the product feeling like one designed thing from landing page
//          through to legal pages.
//
// PROPS:
//   activePage — highlights the correct nav item in the top bar
// =============================================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

const NAV_LINKS = [
  { label: 'Methodology', href: '/methodology' },
  { label: 'Framework',   href: '/framework'   },
  { label: 'Alignment',   href: '/alignment'   },
];

export default function SharedNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 md:px-10 md:py-5 max-w-5xl mx-auto">

        {/* Logo — clicking returns to landing */}
        <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10 group-hover:bg-zinc-800 transition-colors">
            <ShieldCheck className="text-white w-4 h-4 stroke-[2.5px]" />
          </div>
          <span>VSME</span>
          <span className="text-gray-400 font-medium text-lg">OS</span>
        </Link>

        {/* Centre nav — methodology / framework / alignment */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em]">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${
                pathname === href
                  ? 'text-black'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right — back to app or start */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link
              href="/supplier/hub"
              className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
            >
              <ArrowLeft size={12} /> Back to App
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/supplier">
              <button className="hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}