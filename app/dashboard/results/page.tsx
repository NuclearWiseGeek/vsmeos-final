'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 1. Icons & UI Group all icons into one single import block
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
import CarbonReportPDF from '@/components/CarbonReportPDF'; // The file we created

// 3. Logic & Data
import { useESG } from '@/context/ESGContext';
import { calculateEmissions, summarizeEmissions } from '@/utils/calculations';

export default function ResultsPage() {
  // --- A. DATA & STATE ---
  const { companyData, setCompanyData, activityData, resetAssessment } = useESG();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Fix hydration issues: Only render PDF logic once client is fully loaded
  useEffect(() => { setIsClient(true) }, []);

  // --- B. CALCULATIONS ENGINE ---
  // We run this live so the numbers are always accurate based on user input
  const results = calculateEmissions(activityData);
  const totals = summarizeEmissions(results);

  // Helper: Professional Number Formatting (e.g. 1,234.56)
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
    <div className="max-w-6xl mx-auto py-12 px-6">
       
       {/* --- 1. HEADER & NAVIGATION --- */}
       <div className="flex justify-between items-center mb-6">
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
        <div className="bg-white border border-gray-100 rounded-[24px] p-8 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-start gap-6">
            <div className="bg-green-50 p-3 rounded-2xl flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-500 stroke-[2.5px]" />
            </div>
            <div>
                <h2 className="text-[22px] font-semibold text-gray-900 tracking-tight mb-2">
                    Assessment Ready
                </h2>
                <p className="text-gray-500 leading-relaxed text-[15px] max-w-2xl">
                    Your data has been successfully processed. The calculation engine has generated your totals below. 
                    Please review the figures and sign the declaration to generate your report 
                    GHG Protocol & ISO 14064-1 quantification methodologies.
                </p>
            </div>
        </div>

       {/* --- 3. MAIN DASHBOARD GRID --- */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
           
           {/* LEFT CARD: Live Metrics */}
           <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col justify-center">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Corporate Carbon Footprint</h3>
               <div className="flex items-baseline gap-3 mb-10">
                   <span className="text-6xl font-extrabold text-gray-900 tracking-tighter">
                       {fmt(totals.total)}
                   </span>
                   <span className="text-xl text-gray-400 font-medium">kgCO2e</span>
               </div>
               
               {/* Breakdown */}
               <div className="space-y-8">
                   {/* Scope 1 */}
                   <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all"></div>
                           <div>
                               <span className="block font-bold text-gray-900">Scope 1</span>
                               <span className="block text-xs text-gray-400">Direct Emissions</span>
                           </div>
                       </div>
                       <span className="font-mono font-bold text-lg text-gray-900">{fmt(totals.scope1)}</span>
                   </div>

                   {/* Scope 2 */}
                   <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-50 group-hover:ring-orange-100 transition-all"></div>
                           <div>
                               <span className="block font-bold text-gray-900">Scope 2</span>
                               <span className="block text-xs text-gray-400">Indirect Energy</span>
                           </div>
                       </div>
                       <span className="font-mono font-bold text-lg text-gray-900">{fmt(totals.scope2)}</span>
                   </div>

                   {/* Scope 3 */}
                   <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-50 group-hover:ring-purple-100 transition-all"></div>
                           <div>
                               <span className="block font-bold text-gray-900">Scope 3</span>
                               <span className="block text-xs text-gray-400">Business Travel</span>
                           </div>
                       </div>
                       <span className="font-mono font-bold text-lg text-gray-900">{fmt(totals.scope3)}</span>
                   </div>
               </div>
           </div>

           {/* RIGHT CARD: Attestation & Download */}
           <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col justify-between">
               <div>
                   <h3 className="text-base font-bold text-gray-900 mb-8 flex items-center gap-2">
                       <ShieldCheck size={20} className="text-black"/> 
                       Attestation & Download
                   </h3>
                   
                   <div className="mb-8">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                           Authorized Signer Name
                       </label>
                       <input 
                           type="text" 
                           value={companyData.signer || ''} 
                           onChange={(e) => setCompanyData({...companyData, signer: e.target.value})}
                           className="w-full border-b-2 border-gray-200 py-3 text-2xl font-medium focus:border-black outline-none bg-transparent transition-colors placeholder-gray-300 text-gray-900"
                           placeholder="e.g. Jean Dupont"
                       />
                       
                       <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                           <p className="text-xs text-gray-500 leading-relaxed">
                               <span className="font-bold text-gray-900">Legal Disclaimer:</span> By generating this document, you attest that the provided activity data is accurate to the best of your knowledge. This digital signature will appear on your final ISO 14064-1 declaration.
                           </p>
                       </div>
                   </div>
               </div>
               
               <div className="mt-4">
                   {/* PDF LOGIC: 
                       Only show button if name is typed.
                       Passes 'companyData' and 'totals' to the PDF so the numbers are real.
                   */}
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
                            // ADD THIS DEBUGGING LOGIC
                            if (error) {
                                console.error("PDF Generation Error:", error);
                                return <button className="text-red-500">Error Generating PDF (Check Console)</button>;
                            }
                            return (
                                <button 
                                    disabled={loading} 
                                    className="w-full bg-black text-white py-5 rounded-xl font-bold..."
                                >
                                    {loading ? 'Generating PDF...' : 'Download Official PDF'}
                                </button>
                            );
                        }}
                    </PDFDownloadLink>
                   ) : (
                       <button disabled className="w-full bg-gray-100 text-gray-400 py-5 rounded-xl font-bold text-lg cursor-not-allowed flex justify-center items-center gap-2 border border-gray-200">
                          <AlertCircle size={22} /> Enter Name to Unlock
                       </button>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
}