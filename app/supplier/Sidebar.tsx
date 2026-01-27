'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Factory, 
  Truck, 
  FileText, 
  Settings, 
  CheckCircle,
  Zap 
} from 'lucide-react';

export default function SupplierSidebar() {
  const pathname = usePathname();

  // UPDATED LINKS: Now pointing to /supplier/...
  const links = [
    { 
      name: 'Hub', 
      href: '/supplier/hub',  // Changed from /supplier/hub
      icon: LayoutDashboard 
    },
    { 
      name: 'Scope 1 (Direct)', 
      href: '/supplier/scope1', 
      icon: Factory 
    },
    { 
      name: 'Scope 2 (Energy)', 
      href: '/supplier/scope2', 
      icon: Zap 
    },
    { 
      name: 'Scope 3 (Supply)', 
      href: '/supplier/scope3', 
      icon: Truck 
    },
    { 
      name: 'Your Report', 
      href: '/supplier/results', 
      icon: FileText 
    },
    { 
      name: 'Settings', 
      href: '/supplier/settings', 
      icon: Settings 
    },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col p-4 fixed left-0 top-0 overflow-y-auto z-10">
      {/* HEADER */}
      <div className="flex items-center gap-2 px-4 mb-8">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">V</div>
        <span className="font-bold text-xl tracking-tight">VSME OS</span>
      </div>
      
      {/* NAVIGATION LINKS */}
      <div className="flex-1 space-y-1">
         {links.map((link) => {
           const Icon = link.icon;
           // Check if we are on this page
           const isActive = pathname?.startsWith(link.href);
           
           return (
             <Link 
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive 
                    ? 'bg-black text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
                <Icon size={18} />
                <span>{link.name}</span>
                {link.name === 'Your Report' && (
                  <CheckCircle size={14} className="ml-auto text-emerald-400" />
                )}
            </Link>
           );
         })}
      </div>

      {/* FOOTER */}
      <div className="mt-auto px-4 pt-8">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Current Plan</p>
          <p className="text-sm font-bold text-gray-900">Standard Supplier</p>
        </div>
      </div>
    </div>
  );
}