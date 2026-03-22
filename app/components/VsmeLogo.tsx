// =============================================================================
// FILE: app/components/VsmeLogo.tsx
// PURPOSE: The VSME OS brand mark — deep forest square + gold verification check.
//
// USAGE:
//   <VsmeLogo size={32} />           → 32px icon (nav bars, favicons)
//   <VsmeLogo size={48} />           → 48px icon (sidebars)
//   <VsmeLogo size={80} />           → 80px icon (hero, app icon)
//   <VsmeLogo size={32} mono />      → Monochrome version (PDF headers)
//
// BRAND COLORS:
//   Deep forest: #0C2918 (icon background)
//   Gold:        #C9A84C (checkmark stroke)
//   Gold glow:   #DFC06A (subtle inner glow, opacity 0.3)
// =============================================================================

export default function VsmeLogo({ size = 32, mono = false }: { size?: number; mono?: boolean }) {
  const r = size * 0.22; // border-radius scales with size
  const sw = Math.max(size * 0.075, 2); // stroke width scales but has minimum
  const glow = sw * 0.45; // glow stroke is thinner

  // Checkmark coordinates (normalized to viewBox 0-34)
  const check = "M9 13 L17 25 L27 8";

  if (mono) {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="34" height="34" rx={r} fill="currentColor" opacity="0.9" />
        <path d={check} stroke="white" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="34" height="34" rx={r} fill="#0C2918" />
      <path d={check} stroke="#C9A84C" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <path d={check} stroke="#DFC06A" strokeWidth={glow} strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </svg>
  );
}