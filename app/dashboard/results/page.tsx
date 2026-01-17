'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 1. Icons & UI Group
import { 
  CheckCircle2, 
  RotateCcw, 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

// 2. PDF Tools
import { PDFDownloadLink } from '@react-pdf/renderer';
import CarbonReportPDF from '@/components/CarbonReportPDF';

// 3. Logic & Data
import { useESG } from '@/context/ESGContext';
import { calculateEmissions, summarizeEmissions } from '@/utils/calculations';

export default function ResultsPage() {
  // --- A. DATA & STATE ---
  const { companyData, setCompanyData, activityData, resetAssessment } = useESG();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Fix hydration issues
  useEffect(() => { setIsClient(true) }, []);

  // --- B. CALCULATIONS ENGINE ---
  const results = calculateEmissions(activityData);
  const totals = summarizeEmissions(results);

  // Helper: Professional Number Formatting
  const fmt = (n: number) => {
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(n);
  };

  // --- C. ACTIONS ---
  const handleReset = () => {
      if (window.confirm("Are you sure you want to start a new assessment? This will clear all your current data.")) {
          resetAssessment(); 
          router.push('/dashboard/hub'); 
      }
  };

  // Loading State
  if (!isClient) return <div className="p-12 text-center text-gray-400">Loading engine...</div>;

  return (
    // 1. Fluid Container: px-4 on mobile, px-6 on desktop
    <div className="max-w-6xl mx-auto py-8 px-4 sm:py-12 sm:px-6">
       
       {/* --- 1. HEADER & NAVIGATION --- */}
       {/* Stack vertically on mobile (flex-col), horizontal on tablet (sm:flex-row) */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
           <Link href="/dashboard/hub" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors group">
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> 
               Back to Assessment Hub
           </Link>

           <button 
               onClick={handleReset}
               className="text-sm text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
           >
               <RotateCcw size={14} /> Start New Assessment
           </button>
       </div>
      
       {/* --- 2. SUCCESS BANNER --- */}
       {/* Responsive padding and stacking */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-8 mb-8 sm:mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="bg-green-50 p-3 rounded-2xl flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-500 stroke-[2.5px]" />
            </div>
            <div>
                <h2 className="text-xl sm:text-[22px] font-semibold text-gray-900 tracking-tight mb-2">
                    Assessment Ready
                </h2>
                <p className="text-gray-500 leading-relaxed text-sm sm:text-[15px] max-w-2xl">
                    Your data has been successfully processed. The calculation engine has generated your totals below. 
                    Please review the figures and sign the declaration to generate your report 
                    GHG Protocol & ISO 14064-1 quantification methodologies.
                </p>
            </div>
        </div>

       {/* --- 3. MAIN DASHBOARD GRID --- */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
           
           {/* LEFT CARD: Live Metrics */}
           {/* Mobile Padding: p-6 vs Desktop p-10 */}
           <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col justify-center">
               <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Corporate Carbon Footprint</h3>
               <div className="flex items-baseline gap-2 sm:gap-3 mb-8 sm:mb-10">
                   {/* Responsive Font Size: text-4xl -> text-6xl */}
                   <span className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tighter">
                       {fmt(totals.total)}
                   </span>
                   <span className="text-lg sm:text-xl text-gray-400 font-medium">kgCO2e</span>
               </div>
               
               {/* Breakdown */}
               <div className="space-y-6 sm:space-y-8">
                   {/* Scope 1 */}
                   <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all"></div>
                           <div>
                               <span className="block font-bold text-gray-900 text-sm sm:text-base">Scope 1</span>
                               <span className="block text-[10px] sm:text-xs text-gray-400">Direct Emissions</span>
                           </div>
                       </div>
                       <span className="font-mono font-bold text-base sm:text-lg text-gray-900">{fmt(totals.scope1)}</span>
                   </div>

                   {/* Scope 2 */}
                   <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-50 group-hover:ring-orange-100 transition-all"></div>
                           <div>
                               <span className="block font-bold text-gray-900 text-sm sm:text-base">Scope 2</span>
                               <span className="block text-[10px] sm:text-xs text-gray-400">Indirect Energy</span>
                           </div>
                       </div>
                       <span className="font-mono font-bold text-base sm:text-lg text-gray-900">{fmt(totals.scope2)}</span>
                   </div>

                   {/* Scope 3 */}
                   <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-50 group-hover:ring-purple-100 transition-all"></div>
                           <div>
                               <span className="block font-bold text-gray-900 text-sm sm:text-base">Scope 3</span>
                               <span className="block text-[10px] sm:text-xs text-gray-400">Business Travel</span>
                           </div>
                       </div>
                       <span className="font-mono font-bold text-base sm:text-lg text-gray-900">{fmt(totals.scope3)}</span>
                   </div>
               </div>
           </div>

           {/* RIGHT CARD: Attestation & Download */}
           <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col justify-between">
               <div>
                   <h3 className="text-base font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2">
                       <ShieldCheck size={20} className="text-black"/> 
                       Attestation & Download
                   </h3>
                   
                   <div className="mb-8">
                       <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                           Authorized Signer Name
                       </label>
                       <input 
                           type="text" 
                           value={companyData.signer || ''} 
                           onChange={(e) => setCompanyData({...companyData, signer: e.target.value})}
                           className="w-full border-b-2 border-gray-200 py-3 text-xl sm:text-2xl font-medium focus:border-black outline-none bg-transparent transition-colors placeholder-gray-300 text-gray-900"
                           placeholder="e.g. Jean Dupont"
                       />
                       
                       <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                           <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                               <span className="font-bold text-gray-900">Legal Disclaimer:</span> By generating this document, you attest that the provided activity data is accurate to the best of your knowledge. This digital signature will appear on your final ISO 14064-1 declaration.
                           </p>
                       </div>
                   </div>
               </div>
               
               <div className="mt-4">
                   {/* PDF LOGIC */}
                   {isClient && companyData.signer && companyData.signer.length > 2 ? (
                    <PDFDownloadLink 
                        document={
                            <CarbonReportPDF 
                                company={companyData} 
                                totals={totals}
                                breakdown={results}
                                activityData={activityData}
                            />
                        } 
                        fileName={`VSME_Report.pdf`}
                    >
                        {({ loading, error }) => {
                            if (error) {
                                console.error("PDF Generation Error:", error);
                                return <button className="text-red-500">Error Generating PDF (Check Console)</button>;
                            }
                            return (
                                <button 
                                    disabled={loading} 
                                    className="w-full bg-black text-white py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-lg"
                                >
                                    {loading ? 'Generating PDF...' : (
                                        <>
                                            <Download size={18} /> Download Official PDF
                                        </>
                                    )}
                                </button>
                            );
                        }}
                    </PDFDownloadLink>
                   ) : (
                       <button disabled className="w-full bg-gray-100 text-gray-400 py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-lg cursor-not-allowed flex justify-center items-center gap-2 border border-gray-200">
                          <AlertCircle size={22} /> Enter Name to Unlock
                       </button>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
}