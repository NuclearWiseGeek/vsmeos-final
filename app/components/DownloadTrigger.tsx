'use client';

import React, { useState } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
// We use a standard import here because this file is already isolated by "use client"
import { pdf } from '@react-pdf/renderer';
import CarbonReportPDF from '@/components/CarbonReportPDF';

interface DownloadTriggerProps {
  companyData: any;
  totals: any;
  breakdown: any[]; // <--- ADDED THIS (Receives the list for Page 2)
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
      // 1. Prepare Data
      const cleanCompany = JSON.parse(JSON.stringify({ ...companyData, signer: debouncedSigner || "" }));
      const cleanTotals = JSON.parse(JSON.stringify(totals));
      const cleanActivity = JSON.parse(JSON.stringify(activityData));
      const cleanFiles = JSON.parse(JSON.stringify(fileVault));
      // We use the breakdown passed from the parent, ensuring it's clean
      const cleanBreakdown = JSON.parse(JSON.stringify(breakdown));

      // 2. Create the Document Element manually
      const doc = (
        <CarbonReportPDF 
          company={cleanCompany}
          totals={cleanTotals}
          breakdown={cleanBreakdown} // <--- PASSING THE DATA HERE
          activityData={cleanActivity}
          files={cleanFiles}
        />
      );

      // 3. Generate Blob
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      // 4. Trigger Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `VSME_Report_${cleanCompany.year || '2024'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Error generating PDF. Please ensure your 'CarbonReportPDF.tsx' file uses <Document>, <Page>, <View> tags, NOT <div> or <html> tags.");
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