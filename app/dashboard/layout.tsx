'use client';

import { ESGProvider } from '@/context/ESGContext';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import CompanyOnboarding from '@/components/CompanyOnboarding'; 
import AutoSave from '@/components/AutoSave'; // <--- 1. IMPORT THIS

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ESGProvider>
      {/* 2. MOUNT THE ENGINE HERE */}
      <CompanyOnboarding /> 
      <AutoSave /> 
      
      <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans selection:bg-blue-100">
        
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center transition-all">
            <Link href="/dashboard/hub" className="font-bold text-xl tracking-tight flex items-center gap-2 group">
                <span className="bg-black text-white px-2 py-1 rounded text-sm group-hover:bg-gray-800 transition-colors">VSME</span>
                <span className="group-hover:text-gray-600 transition-colors">OS</span>
            </Link>
            
            <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest hidden md:block">Enterprise Edition</span>
                
                <div className="flex items-center">
                    <UserButton afterSignOutUrl="/"/>
                </div>
            </div>
        </nav>

        {/* Main Content Area */}
        <main className="relative">
            {children}
        </main>
      
      </div>
    </ESGProvider>
  );
}