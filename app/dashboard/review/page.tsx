'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function ReviewPage() {
  const { data, setData } = useESG();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues by waiting for client load
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Prevent flash of empty content

  // 1. DYNAMIC CALCULATIONS (The "Brain" 🧠)
  // We check if the user actually typed a number greater than 0
  const s1_gas = Number(data.gas) || 0;
  const s1_fuel = (Number(data.diesel) || 0) + (Number(data.petrol) || 0);
  const s1_total = s1_gas + s1_fuel + (Number(data.heatingOil) || 0);

  const s2_elec = Number(data.elec) || 0;
  const s2_heat = Number(data.districtHeat) || 0;
  const s2_total = s2_elec + s2_heat;

  const s3_travel = (Number(data.flightKm) || 0) + (Number(data.vehicleKm) || 0);
  
  // Status Checkers
  const hasScope1 = s1_total > 0;
  const hasScope2 = s2_total > 0;
  const hasScope3 = s3_travel > 0; // Scope 3 is often optional, but we track it

  const handleContinue = () => {
    if (!data.signerName || data.signerName.trim() === "") {
      alert("⚠️ Please sign the declaration (enter your name) to generate the certificate.");
      return;
    }
    
    setLoading(true);
    // Simulate a secure "Saving..." delay
    setTimeout(() => {
      router.push('/dashboard/results');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Review & Certify</h1>
        <p className="text-gray-400">Step 4 of 5: Verify your data before generating the legal PDF.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* --- LEFT COLUMN: LIVE DATA SUMMARY --- */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span>📊</span> Live Data Summary
            </h3>
            
            <div className="space-y-4">
              
              {/* Scope 1 Status */}
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-800">
                <div>
                  <div className="text-gray-400 text-xs uppercase font-bold">Scope 1: Direct</div>
                  <div className="text-white text-sm">Gas, Fuel, Heating</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${hasScope1 ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/20 border-red-900 text-red-500'}`}>
                  {hasScope1 ? '✅ Data Present' : '❌ Empty'}
                </div>
              </div>

              {/* Scope 2 Status */}
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-800">
                <div>
                  <div className="text-gray-400 text-xs uppercase font-bold">Scope 2: Energy</div>
                  <div className="text-white text-sm">Electricity (Grid)</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${hasScope2 ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/20 border-red-900 text-red-500'}`}>
                  {hasScope2 ? '✅ Data Present' : '❌ Empty'}
                </div>
              </div>

              {/* Scope 3 Status */}
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-800">
                <div>
                  <div className="text-gray-400 text-xs uppercase font-bold">Scope 3: Indirect</div>
                  <div className="text-white text-sm">Travel, Commute</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${hasScope3 ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                  {hasScope3 ? '✅ Data Present' : '⚪ Optional'}
                </div>
              </div>

            </div>
            
            <button 
               onClick={() => router.push('/dashboard/scope1')}
               className="mt-6 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-all"
            >
              ✏️ Edit Activity Data
            </button>
          </div>

          {/* UPLOAD BOX (Restored) */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-2">📎 Evidence Upload</h3>
            <p className="text-xs text-gray-500 mb-4">Attach invoices (PDF/JPG) for audit trail.</p>
            <div className="border-2 border-dashed border-gray-700 hover:border-blue-500 hover:bg-gray-800/50 rounded-lg p-8 text-center cursor-pointer transition-all">
               <span className="text-2xl block mb-2">📂</span>
               <span className="text-sm text-gray-400">Click to Select Files</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: CERTIFICATION --- */}
        <div className="space-y-6">
          <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-8 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-blue-400 font-bold mb-6 text-xl">Legal Declaration</h3>
              
              <div className="prose prose-invert text-sm text-gray-300 space-y-4 mb-8">
                <p>
                  By signing below, I certify that the data provided in this assessment:
                </p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Accurately reflects the operational activities of <strong>{data.companyName || '[Company Name]'}</strong>.</li>
                  <li>Is based on valid internal documentation (invoices, meters).</li>
                  <li>Follows the reporting period of <strong>2025</strong>.</li>
                </ul>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Authorized Signatory</label>
                <input 
                  type="text" 
                  value={data.signerName}
                  onChange={(e) => setData({ ...data, signerName: e.target.value })}
                  placeholder="e.g. Jean Dupont"
                  className="w-full bg-black border border-gray-600 rounded-lg px-4 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {!data.signerName && (
                  <p className="text-xs text-red-500 mt-1">* Required to generate PDF</p>
                )}
              </div>
            </div>

            <button 
              onClick={handleContinue}
              disabled={loading}
              className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-2
                ${loading 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-white hover:shadow-green-500/25'
                }`}
            >
              {loading ? (
                <span>🔄 Processing...</span>
              ) : (
                <span>✅ Certify & Generate PDF</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}