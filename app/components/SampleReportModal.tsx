/* components/ui/SampleReportModal.tsx */
'use client';

import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Lock, Layers } from 'lucide-react';

export default function SampleReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* 1. BLURRED OVERLAY */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* 2. THE MODAL CONTAINER */}
      <div className="relative bg-[#F4F4F5] w-full max-w-4xl max-h-[90vh] rounded-[24px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="text-white w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-widest">Document Preview</h3>
              <p className="text-[10px] text-zinc-400">Full 3-Page Assessment Structure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors group">
            <X className="w-5 h-5 text-zinc-400 group-hover:text-black" />
          </button>
        </div>

        {/* SCROLLABLE PREVIEW AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-zinc-100 flex justify-center relative">
          
          {/* VISUAL STACK EFFECT (Implies depth/multiple pages) */}
          <div className="absolute top-[55px] bg-white w-[92%] max-w-[200mm] h-[200px] shadow-sm border border-zinc-200 rounded-sm -rotate-1"></div>
          <div className="absolute top-[52px] bg-white w-[96%] max-w-[205mm] h-[200px] shadow-sm border border-zinc-200 rounded-sm rotate-1"></div>

          {/* --- THE MAIN A4 PAGE MOCKUP --- */}
          <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl shadow-zinc-900/10 p-[40px] md:p-[50px] text-[#18181b] relative overflow-hidden z-10">
            
            {/* --- BLURRED TOP: HEADER & PROFILE (Data Hidden) --- */}
            <div className="blur-[4px] opacity-40 select-none pointer-events-none">
                {/* PDF HEADER */}
                <div className="border-b border-zinc-200 pb-4 mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-tight text-black mb-1">Corporate Carbon Footprint Declaration</h1>
                <div className="flex justify-between items-end">
                    <p className="text-[10px] text-zinc-500">Report Generation Date: {dateStr}</p>
                    <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-md">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Verified Layout</span>
                    </div>
                </div>
                </div>

                {/* PROFILE CONTAINER */}
                <div className="bg-[#fafafa] border border-zinc-200 rounded-lg p-4 mb-8 grid grid-cols-2 gap-y-4">
                  <div><p className="text-[9px] uppercase tracking-wider text-zinc-400 mb-1">Legal Entity</p><p className="text-sm font-bold text-black">ACME INDUSTRIES SAS</p></div>
                  <div><p className="text-[9px] uppercase tracking-wider text-zinc-400 mb-1">Reporting Period</p><p className="text-sm font-bold text-black">CY 2025</p></div>
                </div>
            </div>

            {/* --- CLEAR ZONE: METHODOLOGY & COMPLIANCE (The Legitimacy Hook) --- */}
            <div className="mb-12 relative z-20 bg-white p-4 -m-4 rounded-xl shadow-lg border border-zinc-100 ring-1 ring-black/5">
               <p className="text-[11px] leading-relaxed text-zinc-600 text-justify mb-4">
                  This report covers <span className="font-bold text-black">Scope 1</span> (Direct), <span className="font-bold text-black">Scope 2</span> (Energy Indirect), and selected <span className="font-bold text-black">Scope 3</span> (Business Travel). Calculations use <span className="font-bold text-black">ADEME Base Carbone v23.0</span> emission factors.
               </p>
               <div className="bg-zinc-50 border-l-2 border-emerald-500 p-3 text-[10px] text-zinc-500">
                  <p className="font-bold text-black mb-2 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500"/> Reporting Standards & Compliance:
                  </p>
                  <ul className="list-none space-y-1.5">
                     <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">•</span> Aligned with GHG Protocol & ISO 14064-1 quantification methodologies.</li>
                     <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">•</span> Supports CSRD ESRS E1 quantitative reporting requirements.</li>
                     <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">•</span> Emission Factors: ADEME Base Carbone v23.0 (France)</li>
                  </ul>
               </div>
            </div>

            {/* --- BLURRED BOTTOM: TABLE (Data Hidden) --- */}
            <div className="relative blur-[4px] opacity-30 select-none pointer-events-none mt-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-2 border-l-2 border-black pl-2">1. Emissions Summary</h4>
                <div className="w-full text-sm">
                    <div className="flex bg-black text-white py-2 px-2 rounded-t-sm">
                        <div className="flex-1 font-bold text-[10px] uppercase tracking-wider">Metric Category</div>
                        <div className="font-bold text-[10px] uppercase tracking-wider">Value (kgCO2e)</div>
                    </div>
                    <div className="flex border-b border-zinc-100 py-2 px-2"><div className="flex-1 text-zinc-700 text-xs">Scope 1</div><div className="font-mono text-zinc-900 text-xs">---.--</div></div>
                    <div className="flex border-b border-zinc-100 py-2 px-2"><div className="flex-1 text-zinc-700 text-xs">Scope 2</div><div className="font-mono text-zinc-900 text-xs">---.--</div></div>
                    <div className="flex border-b border-zinc-100 py-2 px-2"><div className="flex-1 text-zinc-700 text-xs">Scope 3</div><div className="font-mono text-zinc-900 text-xs">---.--</div></div>
                    <div className="flex bg-zinc-100 py-2 px-2 mt-1 font-bold"><div className="flex-1 text-xs">TOTAL</div><div className="font-mono text-xs">----.--</div></div>
                </div>
            </div>
            
            {/* --- "WHAT'S INCLUDED" OVERLAY (The Legitimacy Card) --- */}
            <div className="absolute bottom-0 left-0 right-0 h-[350px] bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-12 z-30">
                <div className="bg-[#18181B] text-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-zinc-700 mx-4">
                    <div className="flex items-center gap-2 mb-4 border-b border-zinc-700 pb-3">
                        <Layers size={16} className="text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Full 3-Page Institutional Output</span>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Page 1 */}
                        <div className="flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-zinc-500">01</span>
                                <span className="text-xs font-medium">Executive Summary</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-bold">Previewing</span>
                        </div>

                        {/* Page 2 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-zinc-500">02</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">Detailed Emissions Breakdown</span>
                                    <span className="text-[9px] text-zinc-400">Granular data across 13 activity sources</span>
                                </div>
                            </div>
                            <Lock size={12} className="text-zinc-500" />
                        </div>

                        {/* Page 3 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-zinc-500">03</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">Declaration of Conformity</span>
                                    <span className="text-[9px] text-zinc-400">Official ISO 14064-1 Attestation</span>
                                </div>
                            </div>
                            <Lock size={12} className="text-zinc-500" />
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="px-8 py-5 bg-white border-t border-zinc-200 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs font-medium text-zinc-500">Audit-Ready Framework</span>
           </div>
           <button onClick={onClose} className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
              Return to Hub
           </button>
        </div>
      </div>
    </div>
  );
}