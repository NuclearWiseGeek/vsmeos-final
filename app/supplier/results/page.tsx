'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { uploadEvidence } from '../../../actions/uploadEvidence';

// 1. Icons
import { 
  CheckCircle2, RotateCcw, ArrowLeft, ShieldCheck, FileText, 
  Plus, X, File, AlertCircle, Loader2, Save, CloudUpload 
} from 'lucide-react';

// 2. Logic & Data
import { useESG } from '@/context/ESGContext';
import { calculateEmissions, summarizeEmissions } from '@/utils/calculations';

// 3. Integration (Clerk + Supabase)
import { useAuth } from '@clerk/nextjs';
import { createSupabaseClient } from '@/utils/supabase';

// 4. Import Your Fixed Download Trigger
const DownloadTrigger = dynamic(() => import('@/components/DownloadTrigger'), {
  ssr: false,
  loading: () => <div className="w-full py-4 text-center text-gray-400">Loading Engine...</div>
});

export default function ResultsPage() {
  const { companyData, setCompanyData, activityData, resetAssessment } = useESG();
  const [isClient, setIsClient] = useState(false);
  
  // Local state
  const [debouncedSigner, setDebouncedSigner] = useState(companyData.signer || "");
  
  // UPGRADE: Store Name AND Url (for the database)
  const [fileVault, setFileVault] = useState<Record<string, Array<{name: string, url: string}>>>({});
  
  // Status States
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const { getToken, userId } = useAuth();
  const router = useRouter();

  // --- CONFIGURATION MAPS ---
  const EVIDENCE_MAP: Record<string, string> = {
    // SCOPE 1
    natural_gas: "Natural Gas Invoices",
    heating_oil: "Heating Oil Receipts",
    propane: "Propane Purchase Logs",
    diesel: "Diesel Fuel Logs",
    petrol: "Petrol/Gas Receipts",
    ref_R410A: "HVAC Log (R410A)",
    ref_R32: "HVAC Log (R32)",
    ref_R134a: "HVAC Log (R134a)",
    ref_R404A: "Refrigeration Log (R404A)",

    // SCOPE 2
    electricity_fr: "Grid Electricity Bills",
    electricity_green: "Green Energy Certificates (GoO/RECs)",
    district_heat: "District Heating Bills",
    district_cool: "District Cooling Bills",

    // SCOPE 3
    grey_fleet: "Mileage Claims (Car)",
    rail_travel: "Train/Rail Ticket Summary",
    air_travel: "Flight Records",
    hotel_nights: "Hotel Expenses"
  };

  const ACTIVITY_LABELS: Record<string, string> = {
    // SCOPE 1
    natural_gas: "Natural Gas",
    heating_oil: "Heating Oil",
    propane: "Propane",
    diesel: "Fleet Diesel",
    petrol: "Fleet Petrol",
    ref_R410A: "Fugitive Emissions (R410A)",
    ref_R32: "Fugitive Emissions (R32)",
    ref_R134a: "Fugitive Emissions (R134a)",
    ref_R404A: "Fugitive Emissions (R404A)",

    // SCOPE 2
    electricity_fr: "Grid Electricity",
    electricity_green: "Green Electricity (Market-Based)",
    district_heat: "District Heating",
    district_cool: "District Cooling",

    // SCOPE 3
    grey_fleet: "Employee Vehicles (Grey Fleet)",
    rail_travel: "Rail Travel",
    air_travel: "Business Flights",
    hotel_nights: "Hotel Stays"
  };

  // --- ORDER ENFORCEMENT ---
  // This array ensures the evidence list appears in the exact same order as the Hub/Inputs
  const PRESCRIBED_ORDER = [
    // Scope 1
    "natural_gas", "heating_oil", "propane", "diesel", "petrol", 
    "ref_R410A", "ref_R32", "ref_R134a", "ref_R404A",
    // Scope 2
    "electricity_fr", "electricity_green", "district_heat", "district_cool",
    // Scope 3
    "grey_fleet", "rail_travel", "air_travel", "hotel_nights"
  ];

  // Logic: Iterate through our ORDER array, not the random activityData keys
  const requiredEvidence = PRESCRIBED_ORDER.filter(key => {
    // @ts-ignore
    return (activityData[key] && parseFloat(activityData[key]) > 0) && EVIDENCE_MAP[key];
  });

  // --- B. DATABASE & STORAGE ACTIONS ---

  // 1. SANITY CHECK: Save Data to Supabase
  const saveToDatabase = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
        const token = await getToken({ template: 'supabase' });
        if (!token) throw new Error("No auth token found");
        
        const supabase = createSupabaseClient(token);

        // Step 1: Save Profile
        // FIX: We cast companyData as 'any' to ignore the missing type definition for 'industry'
        await supabase.from('profiles').upsert({
            id: userId,
            company_name: companyData.name || "Unknown",
            industry: (companyData as any).industry || "General", 
            country: companyData.country || "France",
            updated_at: new Date().toISOString()
        });

        // Step 2: Save Assessment & Links
        const results = calculateEmissions(activityData);
        await supabase.from('assessments').upsert({
            user_id: userId,
            year: parseInt(companyData.year) || 2024,
            activity_data: activityData,
            emissions_totals: summarizeEmissions(results),
            evidence_links: fileVault, 
            status: 'draft',
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, year' });

        setSaveStatus("success");
        console.log("✅ Data synced to Supabase successfully.");

    } catch (err) {
        console.error("Save Error:", err);
        setSaveStatus("error");
        alert("Failed to save to database. Check console for details.");
    } finally {
        setIsSaving(false);
    }
  };

// 2. SMART UPLOAD: Uses Server Action to bypass UUID issues
  const handleAddFile = (key: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".pdf,.png,.jpg,.jpeg,.csv,.xlsx"; 
    
    input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        setIsUploading(true);
        setIsSaving(false); // Reset save status on new upload
        try {
            // Path: UserID/Year/Field/Timestamp_Filename
            const filePath = `${userId}/${companyData.year || 'general'}/${key}/${Date.now()}_${file.name}`;
            
            // Prepare FormData for the Server Action
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', filePath);

            // CALL SERVER ACTION
            const publicUrl = await uploadEvidence(formData);

            // Update State with Name AND URL
            setFileVault(prev => ({
                ...prev,
                [key]: [...(prev[key] || []), { name: file.name, url: publicUrl }]
            }));

        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };
    input.click();
  };

  const removeFile = (key: string, indexToRemove: number) => {
      setFileVault(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== indexToRemove) }));
  };

  // --- C. STANDARD LOGIC ---
  useEffect(() => { setIsClient(true) }, []);
  
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSigner(companyData.signer); }, 500);
    return () => clearTimeout(handler);
  }, [companyData.signer]);

  const results = calculateEmissions(activityData);
  const totals = summarizeEmissions(results);
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const handleReset = () => {
      if (window.confirm("Are you sure you want to start a new assessment? This will clear all your current data.")) {
          resetAssessment(); 
          router.push('/supplier/hub'); 
      }
  };

  // --- D. DATA PREPARATION FOR DOWNLOAD TRIGGER ---
  
  // 1. Convert complex fileVault (name+url) to simple (name only) for the PDF
  const simpleFileVault = Object.keys(fileVault).reduce((acc, key) => {
      acc[key] = fileVault[key].map(f => f.name);
      return acc;
  }, {} as Record<string, string[]>);

  // 2. Prepare pretty breakdown with labels
  const prettyBreakdown = Object.entries(results).map(([key, val]: [string, any]) => {
      const id = val?.id || val?.key || val?.activity || key;
      const label = ACTIVITY_LABELS[id] || val?.label || id || "Activity";
      return {
        scope: val?.scope || "Scope 1", 
        activity: label, 
        emissions: val?.emissions || 0
      };
  });

  if (!isClient) return <div className="p-12 text-center text-gray-400">Loading engine...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:py-12 sm:px-6">
       
       {/* HEADER */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
           <Link href="/supplier/hub" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors group">
               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Back to Assessment Hub
           </Link>

           <div className="flex items-center gap-3">
               {/* NEW: SAVE BUTTON */}
               <button 
                   onClick={saveToDatabase}
                   disabled={isSaving}
                   className={`text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                       saveStatus === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 
                       saveStatus === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
                       'bg-white border border-gray-200 hover:border-black text-gray-700'
                   }`}
               >
                   {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                   {isSaving ? "Saving..." : saveStatus === 'success' ? "Saved" : "Save Progress"}
               </button>

               <button onClick={handleReset} className="text-sm text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                   <RotateCcw size={14} /> Start New
               </button>
           </div>
       </div>
      
       {/* SUCCESS BANNER */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-8 mb-8 sm:mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="bg-green-50 p-3 rounded-2xl flex-shrink-0"><CheckCircle2 className="w-6 h-6 text-green-500 stroke-[2.5px]" /></div>
            <div>
                <h2 className="text-xl sm:text-[22px] font-semibold text-gray-900 tracking-tight mb-2">Assessment Ready</h2>
                <p className="text-gray-500 leading-relaxed text-sm sm:text-[15px] max-w-2xl">
                    Your data has been successfully processed. The calculation engine has generated your totals below. Please review the figures and sign the declaration to generate your report GHG Protocol & ISO 14064-1 quantification methodologies.
                    {saveStatus === 'success' && <span className="text-green-600 font-bold ml-1"> Data successfully synced to the database.</span>}
                </p>
            </div>
        </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
           {/* METRICS CARD */}
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

           {/* DOWNLOAD CARD */}
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
                   {/* INTEGRATED DOWNLOAD TRIGGER WITH CLEAN DATA */}
                   <DownloadTrigger 
                     companyData={companyData} 
                     totals={totals}
                     breakdown={prettyBreakdown} // Passed the pretty labels here
                     activityData={activityData}
                     fileVault={simpleFileVault} // Passed the simple {key: [names]} object here
                     debouncedSigner={debouncedSigner}
                   />
               </div>
           </div>
       </div>

       {/* EVIDENCE VAULT */}
       <div className="mb-12">
           <div className="flex items-center justify-between mb-6 px-2">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <FileText className="text-gray-900" size={20}/> Verification Evidence
                   {isUploading && <span className="text-xs text-blue-500 animate-pulse ml-2">Uploading...</span>}
               </h3>
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
                                                               <File size={12}/>
                                                               <span className="max-w-[200px] truncate">{file.name}</span>
                                                               <button onClick={() => removeFile(key, idx)} className="text-gray-400 hover:text-red-500"><X size={12}/></button>
                                                           </div>
                                                       ))}
                                                   </div>
                                               )}
                                           </div>
                                       </div>
                                       <button onClick={() => handleAddFile(key)} className="px-6 py-3 bg-white border border-gray-100 text-gray-900 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:border-black transition-all flex items-center gap-2">
                                           {isUploading ? <Loader2 size={14} className="animate-spin"/> : <CloudUpload size={14}/>} 
                                           {isUploading ? "Uploading..." : "Add File"}
                                       </button>
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