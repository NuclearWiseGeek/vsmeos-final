'use client';

import { ESGProvider } from '@/context/ESGContext';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ESGProvider>
      <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans selection:bg-blue-100">
        
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="font-bold text-xl tracking-tight flex items-center gap-2">
                <span className="bg-black text-white px-2 py-1 rounded text-sm">VSME</span>
                <span>OS</span>
            </Link>
            
            <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest hidden md:block">Enterprise Edition</span>
                {/* Clerk User Profile Button */}
                <UserButton afterSignOutUrl="/"/>
            </div>
        </nav>

        {/* Main Content Area */}
        <main>
            {children}
        </main>
      
      </div>
    </ESGProvider>
  );
}