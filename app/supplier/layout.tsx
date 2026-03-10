'use client';

import { ESGProvider } from '@/context/ESGContext';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import CompanyOnboarding from '@/components/CompanyOnboarding';
import AutoSave from '@/components/AutoSave';
import SupplierProgress from '@/components/SupplierProgress';
import { Settings, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ESGProvider>
      <CompanyOnboarding />
      <AutoSave />

      <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans selection:bg-blue-100">

        {/* ── Top Nav ─────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-gray-100 px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link
            href="/supplier/hub"
            className="font-bold text-xl tracking-tighter flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10 group-hover:bg-zinc-800 transition-colors">
              <ShieldCheck className="text-white w-4 h-4 stroke-[2.5px]" />
            </div>
            <span>VSME</span>
            <span className="text-gray-400 font-medium">OS</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest hidden md:block">
              Supplier Portal
            </span>
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

      </div>
    </ESGProvider>
  );
}