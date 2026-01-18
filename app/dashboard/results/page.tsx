'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// 1. Icons
import { CheckCircle2, RotateCcw, ArrowLeft, ShieldCheck, FileText, Plus, X, File, AlertCircle } from 'lucide-react';

// 2. Logic & Data
import { useESG } from '@/context/ESGContext';
import { calculateEmissions, summarizeEmissions } from '@/utils/calculations';

// 3. Import the Firewall Component
const DownloadTrigger = dynamic(() => import('@/components/DownloadTrigger'), {
  ssr: false,
  loading: () => <div className="w-full py-4 bg-gray-50 text-center text-gray-400 rounded-xl">Loading PDF Engine...</div>
});

export default function ResultsPage() {
  const { companyData, setCompanyData, activityData, resetAssessment } = useESG();
  const [isClient, setIsClient] = useState(false);
  
  // Local state
  const [debouncedSigner, setDebouncedSigner] = useState(companyData.signer || "");
  const [fileVault, setFileVault] = useState<Record<string, string[]>>({});
  
  const router = useRouter();

  // --- A. CONFIGURATION MAPS ---
  
  // Map 1: Evidence Requirements (What files do we need?)
  const EVIDENCE_MAP: Record<string, string> = {
    natural_gas: "Natural Gas Invoices",
    heating_oil: "Heating Oil Receipts",
    propane: "Propane Purchase Logs",
    diesel: "Diesel Fuel Logs",
    petrol: "Petrol/Gas Receipts",
    ref_R410A: "HVAC Log (R410A)",
    ref_R32: "HVAC Log (R32)",
    ref_R134a: "HVAC Log (R134a)",
    electricity_fr: "Electricity Bills",
    district_heat: "District Heating",
    grey_fleet_avg: "Mileage Claims",
    flight_avg: "Flight Records",
    hotel_night_avg: "Hotel Expenses"
  };

  // Map 2: Professional Labels (For the PDF Report)
  // This translates "natural_gas" -> "Natural Gas (Stationary Combustion)"
  const ACTIVITY_LABELS: Record<string, string> = {
    natural_gas: "Natural Gas",
    heating_oil: "Heating Oil",
    propane: "Propane",
    diesel: "Fleet Diesel",
    petrol: "Fleet Petrol",
    ref_R410A: "Fugitive Emissions (R410A)",
    ref_R32: "Fugitive Emissions (R32)",
    ref_R134a: "Fugitive Emissions (R134a)",
    electricity_fr: "Electricity (France Mix)",
    district_heat: "District Heating",
    grey_fleet_avg: "Employee Commuting / Grey Fleet",
    flight_avg: "Business Flights",
    hotel_night_avg: "Hotel Stays"
  };

  const requiredEvidence = Object.keys(activityData).filter(key => {
    // @ts-ignore
    return (activityData[key] && parseFloat(activityData[key]) > 0) && EVIDENCE_MAP[key];
  });

  // --- FILE HANDLING ---
  const handleAddFile = (key: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".pdf,.png,.jpg,.jpeg,.csv,.xlsx"; 
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            setFileVault(prev => ({ ...prev, [key]: [...(prev[key] || []), file.name] }));
        }
    };
    input.click();
  };

  const removeFile = (key: string, indexToRemove: number) => {
      setFileVault(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== indexToRemove) }));
  };

  useEffect(() => { setIsClient(true) }, []);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSigner(companyData.signer); }, 500);
    return () => clearTimeout(handler);
  }, [companyData.signer]);

  // --- CALCULATIONS ---
  const results = calculateEmissions(activityData);
  const totals = summarizeEmissions(results);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const handleReset = () => {
      if (window.confirm("Are you sure you want to start a new assessment? This will clear all your current data.")) {
          resetAssessment(); 
          router.push('/dashboard/hub'); 
      }
  };

  if (!isClient) return <div className="p-12 text-center text-gray-400">Loading engine...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:py-12 sm:px-6">
       
       {/* HEADER */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
           <Link href="/dashboard/hub" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors group">
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Back to Assessment Hub
           </Link>
           <button onClick={handleReset} className="text-sm text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors">
               <RotateCcw size={14} /> Start New Assessment
           </button>
       </div>
      
       {/* SUCCESS BANNER */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-8 mb-8 sm:mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="bg-green-50 p-3 rounded-2xl flex-shrink-0"><CheckCircle2 className="w-6 h-6 text-green-500 stroke-[2.5px]" /></div>
            <div>
                <h2 className="text-xl sm:text-[22px] font-semibold text-gray-900 tracking-tight mb-2">Assessment Ready</h2>
                <p className="text-gray-500 leading-relaxed text-sm sm:text-[15px] max-w-2xl">
                    Your data has been successfully processed. The calculation engine has generated your totals below. Please review the figures and sign the declaration to generate your report GHG Protocol & ISO 14064-1 quantification methodologies. 
                </p>
            </div>
        </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
           {/* LEFT CARD: METRICS */}
           <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col justify-center">
               <h3 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Corporate Carbon Footprint</h3>
               <div className="flex items-baseline gap-2 sm:gap-3 mb-8 sm:mb-10">
                   <span className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tighter">{fmt(totals.total)}</span>
                   <span className="text-lg sm:text-xl text-gray-400 font-medium">kgCO2e</span>
               </div>
               <div className="space-y-6 sm:space-y-8">
                   <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-50"></div>
                           <div><span className="block font-bold text-gray-900 text-sm sm:text-base">Scope 1</span><span className="block text-[10px] sm:text-xs text-gray-400">Direct Emissions</span></div>
                       </div>
                       <span className="font-mono font-bold text-base sm:text-lg text-gray-900">{fmt(totals.scope1)}</span>
                   </div>
                   <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-50"></div>
                           <div><span className="block font-bold text-gray-900 text-sm sm:text-base">Scope 2</span><span className="block text-[10px] sm:text-xs text-gray-400">Indirect Energy</span></div>
                       </div>
                       <span className="font-mono font-bold text-base sm:text-lg text-gray-900">{fmt(totals.scope2)}</span>
                   </div>
                   <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                           <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-50"></div>
                           <div><span className="block font-bold text-gray-900 text-sm sm:text-base">Scope 3</span><span className="block text-[10px] sm:text-xs text-gray-400">Business Travel</span></div>
                       </div>
                       <span className="font-mono font-bold text-base sm:text-lg text-gray-900">{fmt(totals.scope3)}</span>
                   </div>
               </div>
           </div>

           {/* RIGHT CARD: DOWNLOAD */}
           <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col justify-between">
               <div>
                   <h3 className="text-base font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2"><ShieldCheck size={20} className="text-black"/> Attestation & Download</h3>
                   <div className="mb-8">
                       <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Authorized Signer Name</label>
                       <input 
                           type="text" 
                           value={companyData.signer || ''} 
                           onChange={(e) => setCompanyData({...companyData, signer: e.target.value})}
                           className="w-full border-b-2 border-gray-200 py-3 text-xl sm:text-2xl font-medium focus:border-black outline-none bg-transparent transition-colors placeholder-gray-300 text-gray-900"
                           placeholder="e.g. Jean Dupont"
                       />
                       <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                           <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed"><span className="font-bold text-gray-900">Legal Disclaimer:</span> By generating this document, you attest that the provided activity data is accurate to the best of your knowledge. This digital signature will appear on your final declaration.</p>
                       </div>
                   </div>
               </div>
               
               <div className="mt-4">
                    {/* HERE IS THE UPDATED LOGIC FOR PDF LABELS */}
                    <DownloadTrigger 
                      companyData={companyData} 
                      totals={totals}
                      // We map the results and try to find the best label
                      breakdown={Object.entries(results).map(([key, val]: [string, any]) => {
                          // 1. Try to find the ID inside the value (if it's an object)
                          const id = val?.id || val?.key || val?.activity || key;
                          
                          // 2. Look up the pretty name, or fallback to the ID, or fallback to "Activity"
                          const label = ACTIVITY_LABELS[id] || val?.label || id || "Activity";

                          return {
                            scope: val?.scope || "Scope 1", 
                            activity: label, 
                            emissions: val?.emissions || 0
                          };
                      })}
                      activityData={activityData}
                      fileVault={fileVault}
                      debouncedSigner={debouncedSigner}
                    />
               </div>
           </div>
       </div>

       {/* EVIDENCE VAULT */}
       <div className="mb-12">
           <div className="flex items-center justify-between mb-6 px-2">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText className="text-gray-900" size={20}/> Verification Evidence</h3>
               <span className="text-xs font-medium text-gray-400">{Object.values(fileVault).flat().length} Files Attached</span>
           </div>
           <div className="bg-white border border-gray-100 rounded-[28px] overflow-hidden shadow-sm">
               {requiredEvidence.length === 0 ? (
                   <div className="p-16 text-center text-gray-400 italic bg-gray-50/30"><p className="text-sm">No significant emissions detected.</p></div>
               ) : (
                   <div className="divide-y divide-gray-50">
                       {requiredEvidence.map((key) => {
                           const files = fileVault[key] || [];
                           return (
                               <div key={key} className="p-8 hover:bg-gray-50/50 transition-colors">
                                   <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                       <div className="flex items-start gap-5 flex-1">
                                           <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${files.length > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-300'}`}>
                                               {files.length > 0 ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
                                           </div>
                                           <div className="w-full">
                                               <p className="text-[15px] font-bold text-gray-900">{EVIDENCE_MAP[key]}</p>
                                               <p className="text-[11px] text-gray-400 mt-0.5 mb-4">{files.length > 0 ? <span className="text-emerald-500 font-bold uppercase tracking-widest">Audit Trail Linked</span> : "Pending Documentation"}</p>
                                               {files.length > 0 && (
                                                   <div className="flex flex-wrap gap-2">
                                                       {files.map((file, idx) => (
                                                           <div key={idx} className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-[11px] font-bold text-gray-600">
                                                               <File size={12}/><span className="max-w-[200px] truncate">{file}</span><button onClick={() => removeFile(key, idx)} className="text-gray-400 hover:text-red-500"><X size={12}/></button>
                                                           </div>
                                                       ))}
                                                   </div>
                                               )}
                                           </div>
                                       </div>
                                       <button onClick={() => handleAddFile(key)} className="px-6 py-3 bg-white border border-gray-100 text-gray-900 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:border-black transition-all flex items-center gap-2"><Plus size={14}/> Add File</button>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}