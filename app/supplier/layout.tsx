// =============================================================================
// FILE: app/supplier/layout.tsx
// PURPOSE: Supplier section layout wrapper.
//
// RESPONSIVE:
//   Desktop → Sticky top nav with VSME OS logo, settings, and user button
//   Mobile  → Same top nav (compact) + fixed bottom quick-nav bar for
//             fast access to Hub, Scopes, Results, and Vault
//
// INCLUDES: ESGProvider (global state), CompanyOnboarding (first-time setup),
//           AutoSave (debounced saves), SupplierProgress (step indicator)
//
// PHASE 4 CHANGE:
//   - Added "My Reports" (Vault) link to desktop top nav
//   - Added "Vault" tab to mobile bottom nav
// =============================================================================

'use client';

import { ESGProvider } from '@/context/ESGContext';
import { UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import CompanyOnboarding from '@/components/CompanyOnboarding';
import AutoSave from '@/components/AutoSave';
import SupplierProgress from '@/components/SupplierProgress';
import { Settings, LayoutDashboard, Flame, Zap, Plane, FileText, Archive } from 'lucide-react';
import VsmeLogo from '@/components/VsmeLogo';
import { createSupabaseClient } from '@/utils/supabase';

const BOTTOM_NAV = [
  { label: 'Hub',      href: '/supplier/hub',     icon: LayoutDashboard },
  { label: 'Scope 1',  href: '/supplier/scope1',  icon: Flame },
  { label: 'Scope 2',  href: '/supplier/scope2',  icon: Zap },
  { label: 'Scope 3',  href: '/supplier/scope3',  icon: Plane },
  { label: 'Report',   href: '/supplier/results',  icon: FileText },
  { label: 'Vault',    href: '/supplier/vault',    icon: Archive },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userId, getToken } = useAuth();

  // Auto-save supplier role silently on first load (Option B — no onboarding screen)
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) return;
        const supabase = createSupabaseClient(token);
        await supabase
          .from('profiles')
          .upsert({ id: userId, role: 'supplier', updated_at: new Date().toISOString() }, { onConflict: 'id' });
      } catch (e) { /* non-fatal */ }
    })();
  }, [userId]);

  const isVaultActive = pathname?.startsWith('/supplier/vault');

  return (
    <ESGProvider>
      <CompanyOnboarding />
      <AutoSave />

      <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans selection:bg-blue-100 pb-16 sm:pb-0">

        {/* ── Top Nav ─────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Link
            href="/supplier/hub"
            className="font-bold text-lg sm:text-xl tracking-tighter flex items-center gap-2 sm:gap-2.5 group"
          >
            <VsmeLogo size={28} />
            <span>VSME</span>
            <span className="text-gray-400 font-medium">OS</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest hidden md:block">
              Supplier Portal
            </span>

            {/* ── My Reports (Vault) link — desktop only ── */}
            <Link
              href="/supplier/vault"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isVaultActive
                  ? 'bg-[#0C2918] text-[#C9A84C]'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="My Reports"
            >
              <Archive size={14} />
              My Reports
            </Link>

            <Link
              href="/supplier/settings"
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              title="Workspace Settings"
            >
              <Settings size={18} />
            </Link>
            <div className="flex items-center pl-2 border-l border-gray-200 ml-1">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </nav>

        {/* ── Progress stepper — only on scope/results pages ──────── */}
        <SupplierProgress />

        {/* ── Main Content ────────────────────────────────────────── */}
        <main className="relative">
          {children}
        </main>

        {/* ── Mobile Bottom Nav — fixed, sm:hidden ────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 sm:hidden">
          <div className="flex items-center justify-around py-1.5 px-1">
            {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/supplier/hub' && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[44px] ${
                    isActive
                      ? 'text-black'
                      : 'text-gray-400 active:text-gray-600'
                  }`}
                >
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className={`text-[9px] font-bold tracking-wide ${isActive ? 'text-black' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Safe area for phones with gesture bars (iPhone etc.) */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>

      </div>
    </ESGProvider>
  );
}