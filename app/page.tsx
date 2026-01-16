/* app/page.tsx */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Globe, FileText, Zap, BarChart3 } from 'lucide-react';
import SampleReportModal from '@/components/SampleReportModal';

export default function LandingPage() {
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
          {/* Active Voice Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-10">
            <Globe size={12} className="text-blue-500" />
            Standardizing Supply Chain Infrastructure
          </div>

          <h1 className="text-7xl md:text-[115px] font-bold tracking-[-0.06em] text-black leading-[0.82] mb-12">
            Strategic Carbon <br />
            <span className="text-gray-200">Alignment.</span>
          </h1>

          {/* Precision-first Subtext */}
          <p className="text-2xl md:text-3xl text-gray-400 max-w-3xl leading-[1.3] font-light mb-12">
            <span className="text-black font-normal">Precision-first carbon intelligence</span> for the modern supplier. 
            Methodologically aligned with GHG Protocol and ISO 14064-1 to <span className="text-black font-normal">streamline reporting frameworks</span> for global procurement requests.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/dashboard" className="group w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl shadow-black/10">
              Start Assessment
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button 
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border border-gray-200 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <FileText size={20} className="text-gray-400" />
              View Sample Report
            </button>
          </div>
        </div>

        {/* TRUST BAR */}
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

      {/* 3. PRECISION GRID (Pillars Section) */}
      <section id="framework" className="max-w-7xl mx-auto px-8 py-32 border-t border-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          
          {/* PILLAR 1: METHODOLOGY */}
          <div id="methodology" className="space-y-6 group">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <Zap size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">Technical Methodology</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Calculations are powered by the <span className="text-black font-medium">ADEME Base Carbone v23.0</span> database. 
              We utilize verified emission factors and high-resolution activity data to transform raw operational inputs into precise CO2e outputs.
            </p>
          </div>

          {/* PILLAR 2: FRAMEWORK */}
          <div className="space-y-6 group">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
              <BarChart3 size={20} className="text-gray-300 group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">Reporting Framework</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Our declaration architecture follows the <span className="text-black font-medium">CSRD ESRS E1</span> quantitative reporting structure. 
              A comprehensive 3-page output covering Scope 1, 2, and selected Scope 3 categories for seamless procurement integration.
            </p>
          </div>

          {/* PILLAR 3: ALIGNMENT */}
          <div id="alignment" className="space-y-6 group">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
              <ShieldCheck size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">Global Alignment</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Every quantification is structured to align with <span className="text-black font-medium">GHG Protocol</span> Corporate Standards and <span className="text-black font-medium">ISO 14064-1</span>. 
              We bridge the gap between supplier activity and international transparency mandates.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INSTITUTIONAL FOOTER */}
      <footer className="max-w-7xl mx-auto px-8 py-12 border-t border-gray-100 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5 opacity-60">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tighter italic text-black">VSME OS</span>
          </div>
          
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            © 2026 VSME Supplier ESG OS. All rights reserved. 
          </div>

          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className="hover:text-black cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-black cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>

      <SampleReportModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}