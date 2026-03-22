// =============================================================================
// FILE: app/components/VsmeLogo.tsx
// PURPOSE: The VSME OS brand mark — deep forest square + gold verification check.
// =============================================================================

'use client';

import React from 'react';

export default function VsmeLogo({ size = 32, mono = false }: { size?: number; mono?: boolean }) {
  const r = size * 0.22;
  const sw = Math.max(size * 0.075, 2);
  const glow = sw * 0.45;
  const check = "M9 13 L17 25 L27 8";

  if (mono) {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
        <rect width="34" height="34" rx={r} fill="currentColor" opacity="0.9" />
        <path d={check} stroke="white" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      <rect width="34" height="34" rx={r} fill="#0C2918" />
      <path d={check} stroke="#C9A84C" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <path d={check} stroke="#DFC06A" strokeWidth={glow} strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </svg>
  );
}