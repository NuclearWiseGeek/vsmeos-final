'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: 'Command Center', href: '/buyer/dashboard', icon: LayoutDashboard },
    { name: 'My Suppliers', href: '/buyer/dashboard/suppliers', icon: Users },
    { name: 'Settings', href: '/buyer/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      
      {/* SIDEBAR - Apple Style (Light & Clean) */}
      <aside className="w-64 bg-gray-50/80 backdrop-blur-md border-r border-gray-200 flex flex-col fixed h-full z-10">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
           <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center text-white font-bold text-xs mr-2 shadow-sm">V</div>
           <span className="font-bold text-lg tracking-tight text-gray-900">VSME <span className="text-gray-400 font-normal">Enterprise</span></span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-black text-white shadow-md' // Active: Bold Black
                    : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900' // Inactive: Soft Gray
                }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors cursor-pointer">
                <LogOut size={16}/>
                <span>Sign Out</span>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header - Transparent/Glass feel */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
            <h1 className="font-semibold text-gray-900 tracking-tight">Supply Chain Overview</h1>
            <UserButton afterSignOutUrl="/"/> 
        </header>

        <main className="flex-1 p-8 bg-white">
            {children}
        </main>
      </div>
    </div>
  );
}