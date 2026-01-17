/* components/SampleReportModal.tsx */
'use client';

import React from 'react';
import { X, FileText, ShieldCheck, CheckCircle2, TrendingDown, BarChart3 } from 'lucide-react';

export default function SampleReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      {/* 1. BLURRED OVERLAY */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-lg transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* 2. THE MODAL CONTAINER */}
      <div className="relative bg-[#F9FAFB] w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-zinc-100">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-sm">
              <FileText className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-widest">Global Framework Output</h3>
              <p className="text-xs text-zinc-400">3-Page Precision Declaration v1.02</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors group">
            <X className="w-6 h-6 text-zinc-400 group-hover:text-black" />
          </button>
        </div>

        {/* SCROLLABLE PREVIEW CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 bg-zinc-50/50">
          
          {/* PAGE 1: APPLE-GRADE BLACK & ZINC */}
          <div className="bg-white shadow-xl shadow-black/5 border border-zinc-100 rounded-2xl p-10 max-w-3xl mx-auto space-y-8">
             <div className="flex justify-between items-start border-b border-zinc-100 pb-6">
                <div className="space-y-2">
                    <h4 className="text-2xl font-bold tracking-tighter uppercase text-black">Corporate Carbon Footprint</h4>
                    <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">GHG Protocol & ISO 14064-1 Aligned</p>
                </div>
                <div className="text-right space-y-2">
                    <div className="inline-flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-full shadow-sm">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Verified Assessment</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 italic">Page 01 of 03</div>
                </div>
             </div>
             
             {/* DATA GRID */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
                    <p className="text-[9px] text-zinc-400 uppercase font-bold mb-3 tracking-widest relative z-10">Total CO2e Footprint</p>
                    <p className="text-4xl font-bold tracking-tighter text-white relative z-10">
                      1,248.50 <span className="text-sm font-medium text-zinc-500">kgCO2e</span>
                    </p>
                </div>
                
                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold mb-3 tracking-widest">Economic Intensity</p>
                      <p className="text-4xl font-bold tracking-tighter text-black">
                        0.0425 <span className="text-sm font-medium text-zinc-500">kg/€</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-4">
                      <TrendingDown size={14} />
                      <span>Aligned with Sector Avg.</span>
                    </div>
                </div>
             </div>
             
             <div className="w-full h-36 bg-zinc-100 rounded-xl border border-zinc-200 flex flex-col items-center justify-center gap-2">
                <BarChart3 size={24} className="text-zinc-300" />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic text-center px-4">Detailed Analytics Visualization Layer</p>
             </div>
          </div>

          {/* PAGE 2 & 3 BLURRED MOCKUPS */}
          <div className="bg-white shadow-md border border-zinc-100 rounded-2xl p-10 max-w-3xl mx-auto opacity-40 blur-[2px]">
             <div className="w-1/2 h-4 bg-zinc-100 rounded-full mb-6" />
             <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between"><div className="w-1/3 h-2 bg-zinc-50" /><div className="w-1/4 h-2 bg-zinc-100" /></div>
                ))}
             </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 bg-white border-t border-zinc-100 flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Preview Mode</p>
            <button onClick={onClose} className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all shadow-md active:scale-95">
                Return to Hub
            </button>
        </div>
      </div>
    </div>
  );
}