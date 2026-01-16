/* components/SampleReportModal.tsx */
'use client';

import React from 'react';
import { X, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SampleReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      {/* 1. BLURRED OVERLAY */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* 2. THE MODAL CONTAINER */}
      <div className="relative bg-[#F9FAFB] w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <FileText className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-widest">Global Framework Output</h3>
              <p className="text-xs text-gray-400">3-Page Precision Declaration v1.02</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-black" />
          </button>
        </div>

        {/* SCROLLABLE PREVIEW CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 bg-gray-50/50">
          
          {/* PAGE 1 MOCKUP */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-10 max-w-3xl mx-auto space-y-8">
             <div className="flex justify-between border-b border-gray-100 pb-6">
                <div className="space-y-1">
                    <h4 className="text-xl font-bold tracking-tighter uppercase">Corporate Carbon Footprint</h4>
                    <p className="text-[10px] text-gray-400">GHG Protocol & ISO 14064-1 Aligned</p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Assessment: Verified</div>
                    <div className="text-[10px] text-gray-300 italic">Page 01 of 03</div>
                </div>
             </div>
             {/* Data Summary Mockup */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[8px] text-gray-400 uppercase font-bold mb-1">Total Footprint</p>
                    <p className="text-2xl font-bold tracking-tighter">1,248.50 <span className="text-xs font-medium">kgCO2e</span></p>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-[8px] text-blue-400 uppercase font-bold mb-1">Intensity Ratio</p>
                    <p className="text-2xl font-bold tracking-tighter text-blue-600">0.0425 <span className="text-xs font-medium">kg/€</span></p>
                </div>
             </div>
             <div className="w-full h-32 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Visual Analytics Layer</p>
             </div>
          </div>

          {/* PAGE 2 MOCKUP */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-10 max-w-3xl mx-auto opacity-60 scale-95 origin-top transition-transform">
             <h4 className="text-sm font-bold border-b border-gray-100 pb-4 mb-6 uppercase tracking-widest">2. Detailed Emissions Breakdown</h4>
             <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex justify-between border-b border-gray-50 pb-2">
                        <div className="w-1/2 h-2 bg-gray-100 rounded-full" />
                        <div className="w-1/4 h-2 bg-gray-200 rounded-full" />
                    </div>
                ))}
             </div>
          </div>

          {/* PAGE 3 MOCKUP */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-10 max-w-3xl mx-auto opacity-40 scale-90 origin-top transition-transform mb-20">
             <h4 className="text-sm font-bold border-b border-gray-100 pb-4 mb-6 uppercase tracking-widest">3. Declaration of Conformity</h4>
             <div className="space-y-4">
                <div className="w-full h-20 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                    <ShieldCheck className="text-gray-200 w-8 h-8" />
                </div>
                <div className="w-32 h-1 bg-black rounded-full mt-10" />
                <p className="text-[10px] text-gray-300 font-bold uppercase">Authorized Signature</p>
             </div>
          </div>

        </div>

        {/* FOOTER ACTION */}
        <div className="px-8 py-6 bg-white border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Close preview to begin your own strategic assessment.</p>
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-zinc-800 transition-all"
            >
                Return to Hub
            </button>
        </div>
      </div>
    </div>
  );
}