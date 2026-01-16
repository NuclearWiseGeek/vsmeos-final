'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function ReviewPage() {
  const router = useRouter();
  const { data, setData } = useESG();

  // Helper to safely parse strings like "1,000.00" into numbers
  const getVal = (val: string) => {
    if (!val) return 0;
    return parseFloat(val.replace(/,/g, '')) || 0;
  };

  // --- 1. Quick Math for Summary ---
  const FACTORS = {
    gas: 0.244, heatingOil: 3.2, propane: 3.1, diesel: 3.16, petrol: 2.8, r410a: 2088, r32: 675, r134a: 1430,
    elec: 0.052, districtHeat: 0.170, vehicleKm: 0.218, flightKm: 0.14, hotelNights: 6.9
  };
  
  const s1 = (getVal(data.gas) * FACTORS.gas) + (getVal(data.heatingOil) * FACTORS.heatingOil) + (getVal(data.propane) * FACTORS.propane) +
             (getVal(data.diesel) * FACTORS.diesel) + (getVal(data.petrol) * FACTORS.petrol) +
             (getVal(data.r410a) * FACTORS.r410a) + (getVal(data.r32) * FACTORS.r32) + (getVal(data.r134a) * FACTORS.r134a);
  const s2 = (getVal(data.elec) * FACTORS.elec) + (getVal(data.districtHeat) * FACTORS.districtHeat);
  const s3 = (getVal(data.vehicleKm) * FACTORS.vehicleKm) + (getVal(data.flightKm) * FACTORS.flightKm) + (getVal(data.hotelNights) * FACTORS.hotelNights);
  
  const total = s1 + s2 + s3;

  // --- 2. Chart Logic (Percentages) ---
  const p1 = total > 0 ? (s1 / total) * 100 : 0;
  const p2 = total > 0 ? (s2 / total) * 100 : 0;
  const p3 = total > 0 ? (s3 / total) * 100 : 0;

  // CSS Conic Gradient for the Chart
  // Scope 1: Red/Orange (#ef4444)
  // Scope 2: Blue (#3b82f6)
  // Scope 3: Green (#10b981)
  const chartStyle = {
    background: total > 0 
      ? `conic-gradient(#ef4444 0% ${p1}%, #3b82f6 ${p1}% ${p1 + p2}%, #10b981 ${p1 + p2}% 100%)`
      : '#374151', // Grey if empty
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => f.name);
      setData({ ...data, files: [...data.files, ...newFiles] });
    }
  };

  const handleFinalSubmit = () => {
    if (!data.companyName || !data.revenue) {
      alert("Profile Incomplete! Please fill in Company Name and Revenue.");
      router.push('/dashboard/profile');
      return;
    }
    if(!data.signerName) {
      alert("Please sign the report before generating.");
      return;
    }
    router.push('/dashboard/results');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-3xl mx-auto mb-8 border-b border-gray-800 pb-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm">← Back to Dashboard</Link>
        <h1 className="text-2xl font-bold mt-2">Final Review & Evidence</h1>
      </nav>

      <main className="max-w-3xl mx-auto space-y-8">
        
        {/* --- 1. VISUAL SUMMARY (Chart & Numbers) --- */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* The Pie Chart */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-xl" style={chartStyle}>
               {/* Inner Circle (Hole) */}
               <div className="w-28 h-28 bg-gray-900 rounded-full flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-400">Total</span>
                  <span className="text-sm font-bold text-white">{total > 1000 ? (total/1000).toFixed(1) + 't' : Math.round(total)}</span>
               </div>
            </div>

            {/* The Legend & Data */}
            <div className="flex-1 grid grid-cols-1 gap-4 w-full">
               {/* Scope 1 */}
               <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border-l-4 border-red-500">
                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase">Scope 1 (Direct)</div>
                    <div className="text-xs text-gray-500">Fuel, Gas, Refrigerants</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{s1.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    <div className="text-xs text-gray-500">{p1.toFixed(1)}%</div>
                  </div>
               </div>

               {/* Scope 2 */}
               <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border-l-4 border-blue-500">
                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase">Scope 2 (Energy)</div>
                    <div className="text-xs text-gray-500">Electricity, Heating</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{s2.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    <div className="text-xs text-gray-500">{p2.toFixed(1)}%</div>
                  </div>
               </div>

               {/* Scope 3 */}
               <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border-l-4 border-green-500">
                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase">Scope 3 (Indirect)</div>
                    <div className="text-xs text-gray-500">Business Travel</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{s3.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    <div className="text-xs text-gray-500">{p3.toFixed(1)}%</div>
                  </div>
               </div>
            </div>

          </div>
        </section>

        {/* --- 2. EVIDENCE UPLOAD --- */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Evidence Upload</h3>
          <p className="text-sm text-gray-500 mb-4">Upload invoices to support your data (Optional).</p>
          
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
            <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <span className="text-2xl block mb-2">📎</span>
            <p className="text-gray-300 font-medium">Click to attach files</p>
            <p className="text-xs text-gray-600 mt-2">Supported: PDF, JPG, PNG</p>
          </div>
          
          {data.files.length > 0 && (
            <div className="mt-4 space-y-2">
              {data.files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 p-2 rounded">
                  <span>✓</span> {f}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- 3. ATTESTATION --- */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Legal Attestation</h3>
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Authorized Signatory</label>
                <input type="text" required value={data.signerName} onChange={(e) => setData({...data, signerName: e.target.value})} 
                  className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-blue-500 outline-none" placeholder="e.g., John Doe, CEO" />
             </div>
             <p className="text-xs text-gray-600 italic">I certify that this data is accurate and aligns with the GHG Protocol corporate standards.</p>
          </div>
        </section>

        <button onClick={handleFinalSubmit} className="w-full bg-white text-black font-extrabold py-4 rounded-xl hover:bg-gray-200 hover:scale-[1.01] transition-all shadow-lg">
          Generate Official Report ➔
        </button>

      </main>
    </div>
  );
}