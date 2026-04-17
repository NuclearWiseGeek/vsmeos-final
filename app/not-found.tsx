// =============================================================================
// FILE: app/not-found.tsx
// PURPOSE: Custom 404 page.
// force-dynamic prevents build-time prerendering which requires Clerk context.
// =============================================================================

export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#0C2918] flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
            <path d="M9 13L17 25L27 8" stroke="#C9A84C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">404</h1>
        <p className="text-gray-500 mb-8">This page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0C2918] text-[#C9A84C] rounded-xl font-bold text-sm hover:bg-[#122F1E] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}