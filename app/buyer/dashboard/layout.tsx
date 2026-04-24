'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import VsmeLogo from '@/components/VsmeLogo';
import { UserButton, SignOutButton } from "@clerk/nextjs";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: 'Command Center', href: '/buyer/dashboard', icon: LayoutDashboard },
    { name: 'My Suppliers', href: '/buyer/dashboard/suppliers', icon: Users },
    { name: 'Settings', href: '/buyer/dashboard/settings', icon: Settings },
  ];

  const NavLinks = () => (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-[#0C2918] text-[#C9A84C] shadow-md'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <Icon size={18} />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F7F7F5] font-sans text-slate-900">

      {/* ── DESKTOP SIDEBAR — hidden below lg ────────────────── */}
      <aside className="hidden lg:flex w-64 bg-gray-50/80 backdrop-blur-md border-r border-gray-200 flex-col fixed h-full z-10">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-gray-200">
          <VsmeLogo size={24} />
          <span className="font-bold text-lg tracking-tight text-gray-900">VSME <span className="text-gray-400 font-normal">Enterprise</span></span>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-gray-200">
          <SignOutButton redirectUrl="/">
            <button className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors cursor-pointer w-full">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ── MOBILE OVERLAY — visible below lg ────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Slide-in panel */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-slide-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <VsmeLogo size={24} />
                <span className="font-bold text-lg tracking-tight">VSME <span className="text-gray-400 font-normal">Enterprise</span></span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="p-4 space-y-1 flex-1">
              <NavLinks />
            </nav>
            <div className="p-4 border-t border-gray-200">
              <SignOutButton redirectUrl="/">
                <button className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors cursor-pointer w-full">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </SignOutButton>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger — hidden on lg+ */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors -ml-2"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-gray-900 tracking-tight">Supply Chain Overview</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}