/* components/SampleReportModal.tsx */
'use client';

import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Lock, Layers } from 'lucide-react';

export default function SampleReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal — fixed height, no internal scroll needed */}
      <div className="relative bg-[#F4F4F5] w-full max-w-4xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-white/20"
           style={{ maxHeight: 'min(90vh, 780px)' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="text-white w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-widest">Sample Report Preview</h3>
              <p className="text-[10px] text-zinc-400">Full 3-Page Carbon Declaration Structure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors group">
            <X className="w-5 h-5 text-zinc-400 group-hover:text-black" />
          </button>
        </div>

        {/* ── Two-column body — no scroll ─────────────────────────── */}
        <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden">

          {/* LEFT — compressed A4 preview */}
          <div className="flex-1 bg-zinc-100 flex items-start justify-center p-6 overflow-hidden relative">

            {/* Stack depth cards behind */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[85%] h-32 bg-white rounded shadow-sm border border-zinc-200 rotate-1 opacity-60" />
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[88%] h-32 bg-white rounded shadow-sm border border-zinc-200 -rotate-1 opacity-40" />

            {/* A4 mockup — compressed, no min-height */}
            <div className="relative z-10 bg-white w-full shadow-xl shadow-zinc-900/10 rounded-sm border border-zinc-200 overflow-hidden">

              {/* Header — blurred */}
              <div className="blur-[3px] opacity-40 select-none pointer-events-none px-8 pt-7 pb-4 border-b border-zinc-100">
                <h1 className="text-base font-bold uppercase tracking-tight text-black mb-1">Corporate Carbon Footprint Declaration</h1>
                <div className="flex justify-between items-center">
                  <p className="text-[9px] text-zinc-500">Report Date: {dateStr}</p>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 border border-zinc-200 px-1.5 py-0.5 rounded">Verified Layout</span>
                </div>
              </div>

              {/* Profile — blurred */}
              <div className="blur-[3px] opacity-40 select-none pointer-events-none px-8 py-3 border-b border-zinc-100">
                <div className="grid grid-cols-2 gap-x-4">
                  <div><p className="text-[8px] uppercase tracking-wider text-zinc-400 mb-0.5">Legal Entity</p><p className="text-xs font-bold text-black">ACME INDUSTRIES SAS</p></div>
                  <div><p className="text-[8px] uppercase tracking-wider text-zinc-400 mb-0.5">Reporting Period</p><p className="text-xs font-bold text-black">CY 2025</p></div>
                </div>
              </div>

              {/* Methodology — clear, the legitimacy hook */}
              <div className="px-8 py-4 border-b border-zinc-100">
                <p className="text-[10px] leading-relaxed text-zinc-600 mb-2">
                  Covers <span className="font-bold text-black">Scope 1</span>, <span className="font-bold text-black">Scope 2</span>, and <span className="font-bold text-black">Scope 3</span> emissions. Calculated using country-specific ADEME Base Carbone 2024 / DEFRA 2025 factors.
                </p>
                <div className="bg-zinc-50 border-l-2 border-emerald-500 px-3 py-2">
                  <p className="text-[9px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <ShieldCheck size={10} className="text-emerald-500" /> Standards &amp; Compliance
                  </p>
                  <ul className="space-y-1">
                    {[
                      'GHG Protocol Corporate Standard',
                      'ISO 14064-1:2018',
                      'Commission Recommendation (EU) 2025/1710',
                      'CSRD ESRS E1 — Scope 3 data collection',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-1.5 text-[9px] text-zinc-500">
                        <span className="text-emerald-500 font-bold mt-px">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Table — blurred */}
              <div className="blur-[3px] opacity-30 select-none pointer-events-none px-8 py-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-black mb-2">Emissions Summary</p>
                <div className="w-full text-xs">
                  <div className="flex bg-black text-white py-1.5 px-2 rounded-t-sm">
                    <div className="flex-1 font-bold text-[9px] uppercase tracking-wider">Category</div>
                    <div className="font-bold text-[9px] uppercase tracking-wider">kgCO₂e</div>
                  </div>
                  {['Scope 1 — Direct', 'Scope 2 — Energy', 'Scope 3 — Travel', 'TOTAL'].map((row, i) => (
                    <div key={row} className={`flex py-1.5 px-2 border-b border-zinc-100 ${i === 3 ? 'bg-zinc-100 font-bold' : ''}`}>
                      <div className="flex-1 text-zinc-700 text-[10px]">{row}</div>
                      <div className="font-mono text-zinc-400 text-[10px]">██.██</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT — what's in the full report */}
          <div className="w-full md:w-72 flex-shrink-0 bg-zinc-950 text-white flex flex-col p-6 gap-5">

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers size={14} className="text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Full Report — 4 Pages</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Every report generated on VSME OS follows this structure — ready for your buyer's CSRD audit trail.
              </p>
            </div>

            <div className="space-y-3 flex-1">
              {[
                {
                  num: '01',
                  title: 'Executive Summary',
                  desc: 'tCO₂e total, scope breakdown, carbon intensity metric',
                  unlocked: true,
                },
                {
                  num: '02',
                  title: 'Detailed Breakdown',
                  desc: '20 activity sources, emission factors disclosed, country-specific',
                  unlocked: false,
                },
                {
                  num: '03',
                  title: 'Declaration of Conformity',
                  desc: 'Evidence retained, signed attestation, authorised signatory',
                  unlocked: false,
                },
                {
                  num: '04',
                  title: 'Methodology & Audit Trail',
                  desc: 'Factor sources, boundary exclusions, disclaimer & limitations',
                  unlocked: false,
                },
              ].map(({ num, title, desc, unlocked }) => (
                <div key={num} className={`rounded-xl p-4 border ${unlocked ? 'border-emerald-800/50 bg-emerald-950/30' : 'border-zinc-800 bg-zinc-900/50'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500">{num}</span>
                      <span className={`text-xs font-bold ${unlocked ? 'text-white' : 'text-zinc-300'}`}>{title}</span>
                    </div>
                    {unlocked
                      ? <CheckCircle2 size={12} className="text-emerald-400" />
                      : <Lock size={11} className="text-zinc-600" />}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
            >
              Start Your Report
            </button>
            <p className="text-[9px] text-zinc-600 text-center">
              Self-attested · Based on GHG Protocol · Aligned with ISO 14064-1:2018
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}