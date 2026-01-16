/* app/page.tsx */
'use client';

import React, { useState } from 'react'; // 1. Added useState
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Globe, FileText } from 'lucide-react';
import SampleReportModal from '@/components/SampleReportModal'; // 2. Ensure path is correct

export default function LandingPage() {
  // 3. Define the state to track if the modal is open
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 antialiased">
      {/* 1. INSTITUTIONAL NAVIGATION */}
      <nav className="flex items-center justify-between px-8 py-10 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter flex items-center gap-2.5">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
            <ShieldCheck className="text-white w-5 h-5 stroke-[2.5px]" />
          </div>
          VSME <span className="text-gray-400 font-medium">OS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-12 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <Link href="#methodology" className="hover:text-black transition-colors">Methodology</Link>
          <Link href="#framework" className="hover:text-black transition-colors">Framework</Link>
          <Link href="#alignment" className="hover:text-black transition-colors">Alignment</Link>
        </div>

        <Link href="/dashboard" className="px-6 py-3 bg-black text-white text-sm font-bold rounded-full hover:shadow-2xl hover:shadow-black/20 transition-all active:scale-95">
          Launch Hub
        </Link>
      </nav>

      {/* 2. THE PRECISION HERO */}
      <main className="max-w-7xl mx-auto px-8 pt-24 pb-40">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-10">
            <Globe size={12} className="text-blue-500" />
            Standardized Supply Chain Infrastructure
          </div>

          <h1 className="text-7xl md:text-[115px] font-bold tracking-[-0.06em] text-black leading-[0.82] mb-12">
            Strategic Carbon <br />
            <span className="text-gray-200">Alignment.</span>
          </h1>

          <p className="text-2xl md:text-3xl text-gray-400 max-w-3xl leading-[1.3] font-light mb-12">
            <span className="text-black font-normal">Precision-first carbon intelligence</span> for the modern supplier. 
            Methodologically aligned with GHG Protocol and ISO 14064-1 to <span className="text-black font-normal">streamline reporting frameworks</span> for global procurement requests.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/dashboard" className="group w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl shadow-black/10">
              Start Assessment
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {/* 4. Added the onClick trigger here */}
            <button 
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border border-gray-200 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <FileText size={20} className="text-gray-400" />
              View Sample Report
            </button>
          </div>
        </div>

        {/* 3. TRUST & FRAMEWORK BAR */}
        <div className="mt-32 pt-10 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-x-16 gap-y-8 opacity-30 grayscale hover:opacity-50 transition-opacity">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-500">Standard</span>
              <span className="text-xl font-bold tracking-tighter italic text-black">GHG Protocol</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-500">Certification</span>
              <span className="text-xl font-bold tracking-tighter text-black">ISO 14064-1</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-500">Reporting Framework</span>
              <span className="text-xl font-bold tracking-tighter text-black">CSRD ESRS E1</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-500">Validated Database</span>
              <span className="text-xl font-bold tracking-tighter text-blue-900">ADEME Base Carbone</span>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Place the modal here to be rendered when isModalOpen is true */}
      <SampleReportModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}