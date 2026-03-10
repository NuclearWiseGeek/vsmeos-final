// =============================================================================
// FILE: components/SupplierProgress.tsx
// PURPOSE: 3-step progress indicator for the supplier assessment flow.
//
// FLOW:  Profile → Report (Scope 1 + 2 + 3) → Results
//
// The "Report" step is a compound step — it is active across 3 pages.
// Inside it, a mini Scope 1/2/3 sub-bar shows granular progress.
// The connecting lines between steps fill with emerald as steps complete.
//
// USED IN: app/supplier/layout.tsx
// =============================================================================

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, User, FileText, BarChart3 } from 'lucide-react';

// ── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  {
    label:    'Profile',
    href:     '/supplier',
    icon:     User,
    matches:  ['/supplier'],
  },
  {
    label:    'Report',
    href:     '/supplier/scope1',
    icon:     FileText,
    matches:  ['/supplier/scope1', '/supplier/scope2', '/supplier/scope3'],
  },
  {
    label:    'Results',
    href:     '/supplier/results',
    icon:     BarChart3,
    matches:  ['/supplier/results'],
  },
];

// Sub-steps shown inside the Report step
const SCOPE_STEPS = [
  { label: 'Scope 1', href: '/supplier/scope1' },
  { label: 'Scope 2', href: '/supplier/scope2' },
  { label: 'Scope 3', href: '/supplier/scope3' },
];

export default function SupplierProgress() {
  const pathname = usePathname();

  // Hide on hub and settings pages
  if (pathname === '/supplier/hub' || pathname === '/supplier/settings') return null;

  // Which top-level step is active?
  const activeIndex = STEPS.findIndex(s => s.matches.includes(pathname));
  if (activeIndex === -1) return null;

  // Which scope sub-step is active (only relevant when activeIndex === 1)?
  const activeScopeIndex = SCOPE_STEPS.findIndex(s => s.href === pathname);

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-6 py-4 md:px-10">
        <div className="flex items-center justify-between relative">

          {STEPS.map((step, i) => {
            const isComplete = i < activeIndex;
            const isActive   = i === activeIndex;
            const isFuture   = i > activeIndex;
            const Icon       = step.icon;

            return (
              <div key={step.href} className="flex-1 flex items-center">

                {/* ── Step node ───────────────────────────────────────── */}
                <Link
                  href={isComplete || isActive ? step.href : '#'}
                  onClick={e => { if (isFuture) e.preventDefault(); }}
                  className="relative flex flex-col items-center gap-1.5 group"
                  style={{ cursor: isFuture ? 'default' : 'pointer' }}
                >
                  {/* Circle */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isComplete ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 group-hover:bg-emerald-600' : ''}
                    ${isActive   ? 'bg-black text-white shadow-lg shadow-black/20 scale-110' : ''}
                    ${isFuture   ? 'bg-gray-100 text-gray-300' : ''}
                  `}>
                    {isComplete
                      ? <CheckCircle2 size={18} strokeWidth={2.5} />
                      : <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                    }
                  </div>

                  {/* Label */}
                  <span className={`
                    text-[10px] font-bold uppercase tracking-wider
                    transition-colors duration-300
                    ${isActive   ? 'text-black' : ''}
                    ${isComplete ? 'text-emerald-600' : ''}
                    ${isFuture   ? 'text-gray-300' : ''}
                  `}>
                    {step.label}
                  </span>

                  {/* Sub-step indicator — only on the Report step */}
                  {step.label === 'Report' && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {SCOPE_STEPS.map((sub, si) => {
                        const subComplete = isComplete || (isActive && si < activeScopeIndex);
                        const subActive   = isActive && si === activeScopeIndex;
                        return (
                          <div
                            key={sub.label}
                            className={`
                              h-1 w-5 rounded-full transition-all duration-300
                              ${subComplete ? 'bg-emerald-500' : ''}
                              ${subActive   ? 'bg-black' : ''}
                              ${!subComplete && !subActive ? (isActive ? 'bg-gray-200' : 'bg-gray-100') : ''}
                            `}
                          />
                        );
                      })}
                    </div>
                  )}
                </Link>

                {/* ── Connecting line (not after last step) ─────────── */}
                {i < STEPS.length - 1 && (
                  <div className="flex-1 relative h-px mx-3 mb-5 bg-gray-100 overflow-hidden">
                    {/* Filled portion */}
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-400 transition-all duration-500"
                      style={{ width: isComplete ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}