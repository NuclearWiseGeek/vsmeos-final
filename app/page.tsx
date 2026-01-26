/* app/page.tsx */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Globe, FileText, Zap, BarChart3, Menu, X } from 'lucide-react';
import SampleReportModal from '@/components/SampleReportModal';

export default function LandingPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 antialiased scroll-smooth">
      
      {/* 1. INSTITUTIONAL FIXED NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-50">
        <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6 max-w-7xl mx-auto">
          <div className="text-xl md:text-2xl font-bold tracking-tighter flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-black rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
              <ShieldCheck className="text-white w-4 h-4 md:w-5 md:h-5 stroke-[2.5px]" />
            </div>
            VSME <span className="text-gray-400 font-medium text-lg md:text-xl">OS</span>
          </div>
          
          {/* Desktop Navigation Ribbon */}
          <div className="hidden md:flex items-center gap-12 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            <a href="#methodology" className="hover:text-black transition-colors">Methodology</a>
            <a href="#framework" className="hover:text-black transition-colors">Framework</a>
            <a href="#alignment" className="hover:text-black transition-colors">Alignment</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-4 py-2 md:px-6 md:py-3 bg-black text-white text-xs md:text-sm font-bold rounded-full hover:shadow-2xl transition-all active:scale-95">
              Launch Hub
            </Link>
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-black"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-8 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            <a href="#methodology" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-widest text-gray-400">Methodology</a>
            <a href="#framework" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-widest text-gray-400">Framework</a>
            <a href="#alignment" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-widest text-gray-400">Alignment</a>
          </div>
        )}
      </nav>

      {/* 2. THE PRECISION HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-32 md:pt-48 pb-24 md:pb-40">
        <div className="max-w-5xl">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-8 md:mb-10">
            <Globe size={12} className="text-blue-500 animate-pulse" />
            Standardizing Supply Chain Infrastructure
          </div>

          {/* High-Impact Responsive Typography */}
          <h1 className="text-[48px] sm:text-7xl md:text-[115px] font-bold tracking-[-0.06em] text-black leading-[0.9] md:leading-[0.82] mb-10 md:mb-12">
            Strategic Carbon <br />
            <span className="text-gray-200">Alignment.</span>
          </h1>

          {/* Precision-first Subtext */}
          <p className="text-lg sm:text-2xl md:text-3xl text-gray-400 max-w-3xl leading-[1.4] md:leading-[1.3] font-light mb-10 md:mb-12">
            <span className="text-black font-normal">Precision-first carbon intelligence</span> for the modern supplier. 
            Methodologically aligned with GHG Protocol and ISO 14064-1 to <span className="text-black font-normal">streamline reporting frameworks</span> for global procurement requests.
          </p>

          {/* Responsive CTA Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
            <Link href="/dashboard" className="group w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-black text-white rounded-2xl text-base md:text-lg font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl shadow-black/10">
              Start Assessment
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button 
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white text-gray-900 border border-gray-200 rounded-2xl text-base md:text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <FileText size={20} className="text-gray-400" />
              View Sample Report
            </button>
          </div>
        </div>

        {/* 3. TRUST & FRAMEWORK BAR */}
        <div className="mt-24 md:mt-32 pt-10 border-t border-gray-100 overflow-x-auto no-scrollbar">
          <div className="flex flex-nowrap md:flex-wrap items-center gap-x-12 md:gap-x-16 gap-y-8 opacity-30 grayscale hover:opacity-50 transition-opacity min-w-max md:min-w-0">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-500">Standard</span>
              <span className="text-lg md:text-xl font-bold tracking-tighter italic text-black">GHG Protocol</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-500">Quantification Methodo</span>
              <span className="text-lg md:text-xl font-bold tracking-tighter text-black">ISO 14064-1</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-500">Reporting Framework</span>
              <span className="text-lg md:text-xl font-bold tracking-tighter text-black">CSRD ESRS E1</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-500">Validated Database</span>
              <span className="text-lg md:text-xl font-bold tracking-tighter text-blue-900">ADEME Base Carbone</span>
            </div>
          </div>
        </div>
      </main>

      {/* 4. PRECISION GRID (Pillars Section) */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-32 border-t border-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          
          {/* PILLAR 1: METHODOLOGY */}
          <div id="methodology" className="scroll-mt-32 space-y-5 md:space-y-6 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <Zap size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-base md:text-lg font-bold tracking-tight">Technical Methodology</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Calculations are powered by the <span className="text-black font-medium">ADEME Base Carbone v23.0</span> database. 
              We utilize verified emission factors to transform raw operational inputs into precise CO2e outputs.
            </p>
          </div>

          {/* PILLAR 2: FRAMEWORK */}
          <div id="framework" className="scroll-mt-32 space-y-5 md:space-y-6 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
              <BarChart3 size={20} className="text-gray-300 group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-base md:text-lg font-bold tracking-tight">Reporting Framework</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Our declaration architecture follows the <span className="text-black font-medium">CSRD ESRS E1</span> structure. 
              A comprehensive 3-page output covering Scope 1, 2, and 3 for seamless integration into corporate sustainability reports.
            </p>
          </div>

          {/* PILLAR 3: ALIGNMENT */}
          <div id="alignment" className="scroll-mt-32 space-y-5 md:space-y-6 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
              <ShieldCheck size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <h3 className="text-base md:text-lg font-bold tracking-tight">Global Alignment</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Every quantification is structured to align with <span className="text-black font-medium">GHG Protocol</span> and <span className="text-black font-medium">ISO 14064-1</span>. 
              We bridge the gap between supplier activity and international transparency mandates.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INSTITUTIONAL FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 md:px-8 py-12 border-t border-gray-100 mt-10 md:mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
          <div className="flex items-center gap-2.5 opacity-60">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tighter italic text-black uppercase">VSME OS</span>
          </div>
          
          <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">
            © 2026 VSME Supplier ESG OS. All rights reserved. 
          </div>

          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className="hover:text-black cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-black cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>

      {/* SAMPLE REPORT MODAL */}
      <SampleReportModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}