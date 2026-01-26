'use client';

import React, { useState } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import CarbonReportPDF from '@/components/CarbonReportPDF';

interface DownloadTriggerProps {
  companyData: any;
  totals: any;
  breakdown: any[]; 
  activityData: any;
  fileVault: any;
  debouncedSigner: string;
}

export default function DownloadTrigger({ 
  companyData, 
  totals, 
  breakdown, 
  activityData, 
  fileVault, 
  debouncedSigner 
}: DownloadTriggerProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // 1. Scrub Data (Deep Clone to remove React Proxies)
      const cleanCompany = JSON.parse(JSON.stringify({ ...companyData, signer: debouncedSigner || "" }));
      const cleanTotals = JSON.parse(JSON.stringify(totals));
      const cleanActivity = JSON.parse(JSON.stringify(activityData));
      const cleanFiles = JSON.parse(JSON.stringify(fileVault));
      const cleanBreakdown = JSON.parse(JSON.stringify(breakdown));

      // 2. THE CRITICAL FIX: Call the component as a FUNCTION
      // ❌ OLD (Crashes in React 19): const doc = <CarbonReportPDF ... />
      // ✅ NEW (Works): CarbonReportPDF({ ... })
      // This bypasses the React Reconciler and gives the PDF engine the raw object it needs.
      const doc = CarbonReportPDF({
          company: cleanCompany,
          totals: cleanTotals,
          breakdown: cleanBreakdown,
          activityData: cleanActivity,
          files: cleanFiles
      });

      // 3. Generate Blob
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      // 4. Trigger Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `VSME_Report_${cleanCompany.year || '2024'}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("PDF Generation Failed. Please check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isNameValid = debouncedSigner && debouncedSigner.length > 2;

  if (!isNameValid) {
    return (
      <button disabled className="w-full bg-gray-100 text-gray-400 py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-lg cursor-not-allowed flex justify-center items-center gap-2 border border-gray-200">
        <AlertCircle size={22} /> Enter Name to Unlock
      </button>
    );
  }

  return (
    <button 
      onClick={handleDownload}
      disabled={isGenerating}
      className="w-full bg-black text-white py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
    >
      {isGenerating ? (
        <><Loader2 size={18} className="animate-spin" /> Generating Report...</>
      ) : (
        <><Download size={18} /> Download Official PDF</>
      )}
    </button>
  );
}