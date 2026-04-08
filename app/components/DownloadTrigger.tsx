// =============================================================================
// FILE: components/DownloadTrigger.tsx
// PURPOSE: Client-side PDF generation button with multi-stage loading UI.
//
// STAGES (shown in sequence while PDF generates):
//   1. "Preparing your data..."    — immediate
//   2. "Building report pages..."  — after 900ms
//   3. "Almost ready..."           — after 2200ms
//
// The progress bar animates via CSS (pdfProgress keyframe in globals.css).
// Stages create the perception of meaningful progress rather than a frozen UI.
//
// WHY THIS MATTERS:
//   PDF generation can take 2–5 seconds. Without feedback, users think
//   the button is broken. The staged messaging + progress bar converts
//   the wait into the emotional payoff of the product.
// =============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, AlertCircle, FileCheck } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import CarbonReportPDF from '@/components/CarbonReportPDF';

interface DownloadTriggerProps {
  companyData:          any;
  totals:               any;
  breakdown:            any[];
  activityData:         any;
  fileVault:            any;
  debouncedSigner:      string;
  onDownloadComplete?:  () => Promise<void>;
}

const STAGES = [
  'Preparing your data...',
  'Building report pages...',
  'Almost ready...',
];

export default function DownloadTrigger({
  companyData, totals, breakdown, activityData, fileVault, debouncedSigner, onDownloadComplete
}: DownloadTriggerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stageIndex,   setStageIndex]   = useState(0);
  const [done,         setDone]         = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all stage timers on unmount
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const handleDownload = async () => {
    // Reset state
    setIsGenerating(true);
    setStageIndex(0);
    setDone(false);

    // Stage progression timers
    const t1 = setTimeout(() => setStageIndex(1), 900);
    const t2 = setTimeout(() => setStageIndex(2), 2200);
    timersRef.current = [t1, t2];

    try {
      const cleanCompany   = JSON.parse(JSON.stringify({ ...companyData, signer: debouncedSigner || '' }));
      const cleanTotals    = JSON.parse(JSON.stringify(totals));
      const cleanActivity  = JSON.parse(JSON.stringify(activityData));
      const cleanFiles     = JSON.parse(JSON.stringify(fileVault));
      const cleanBreakdown = JSON.parse(JSON.stringify(breakdown));

      const doc = CarbonReportPDF({
        company:      cleanCompany,
        totals:       cleanTotals,
        breakdown:    cleanBreakdown,
        activityData: cleanActivity,
        files:        cleanFiles,
      });

      const blob = await pdf(doc).toBlob();
      const url  = URL.createObjectURL(blob);

      const link      = document.createElement('a');
      link.href       = url;
      link.download   = `VSME_Report_${cleanCompany.year || '2024'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Brief "done" state before resetting
      setDone(true);

      // Fire status update — marks supplier as submitted in DB + buyer dashboard
      if (onDownloadComplete) {
        try { await onDownloadComplete(); } catch (e) { console.error('Status update after download failed:', e); }
      }

      setTimeout(() => {
        setIsGenerating(false);
        setDone(false);
        setStageIndex(0);
      }, 1800);

    } catch (err) {
      console.error('PDF Generation Error:', err);
      timersRef.current.forEach(clearTimeout);
      setIsGenerating(false);
      setStageIndex(0);
      alert('PDF generation failed. Please check the console for details.');
    }
  };

  const isNameValid = debouncedSigner && debouncedSigner.length > 2;

  // ── Locked state (no signer name) ────────────────────────────────────────
  if (!isNameValid) {
    return (
      <button
        disabled
        className="w-full bg-gray-100 text-gray-400 py-4 sm:py-5 rounded-xl font-bold text-sm cursor-not-allowed flex justify-center items-center gap-2 border border-gray-200"
      >
        <AlertCircle size={18} />
        Enter authorised signatory name to unlock
      </button>
    );
  }

  // ── Done state ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <button
        disabled
        className="w-full bg-[#0C2918] text-[#C9A84C] py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#C9A84C]/20"
      >
        <FileCheck size={18} />
        Report Downloaded
      </button>
    );
  }

  // ── Generating state ──────────────────────────────────────────────────────
  if (isGenerating) {
    return (
      <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-lg">
        {/* Stage label */}
        <div className="flex items-center gap-2.5 px-5 py-4">
          <Loader2 size={16} className="animate-spin text-blue-500 flex-shrink-0" />
          <span className="text-sm font-bold text-gray-700">
            {STAGES[stageIndex]}
          </span>
        </div>

        {/* Animated progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-black pdf-progress-bar rounded-r-full" />
        </div>

        {/* Stage dots */}
        <div className="flex items-center gap-2 px-5 py-3">
          {STAGES.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`
                w-1.5 h-1.5 rounded-full transition-all duration-300
                ${i < stageIndex  ? 'bg-[#C9A84C]' : ''}
                ${i === stageIndex ? 'bg-black scale-125' : ''}
                ${i > stageIndex  ? 'bg-gray-200' : ''}
              `} />
              {i < STAGES.length - 1 && (
                <div className={`h-px w-6 transition-colors duration-300 ${i < stageIndex ? 'bg-[#DFC06A]' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
          <span className="text-[10px] text-gray-400 ml-1 font-medium">
            {Math.round((stageIndex / (STAGES.length - 1)) * 85 + 5)}%
          </span>
        </div>
      </div>
    );
  }

  // ── Ready state ───────────────────────────────────────────────────────────
  return (
    <button
      onClick={handleDownload}
      className="w-full bg-[#0C2918] text-[#C9A84C] py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#122F1E] transition-all shadow-lg active:scale-95"
    >
      <Download size={18} />
      Download Official PDF Report
    </button>
  );
}