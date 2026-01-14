'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function Assessment() {
  const router = useRouter();
  const { data, setData } = useESG();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard/results');
  };

  const handleNumChange = (field: string, value: string) => {
    // If empty, set to 0, otherwise parse
    setData({ ...data, [field]: value === '' ? 0 : parseFloat(value) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => f.name);
      setData({ ...data, files: [...data.files, ...newFiles] });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-4xl mx-auto mb-12 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Step 2: Activity Data</h1>
          <p className="text-gray-400 text-sm">Full Scope 1, 2 & 3 Assessment (ADEME v23.0)</p>
        </div>
        <Link href="/dashboard/profile" className="text-gray-500 hover:text-white text-sm">← Back to Profile</Link>
      </nav>

      <main className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* SCOPE 1 */}
          <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-400">🔥 Scope 1: Direct</h2>
            
            <div className="mb-6">
              <h3 className="text-sm text-gray-400 font-bold uppercase mb-4 border-b border-gray-800 pb-2">Stationary Combustion</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Natural Gas (kWh)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" 
                    placeholder="0.00" value={data.gas || ''} onChange={(e) => handleNumChange('gas', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Heating Oil (Liters)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" 
                    placeholder="0.00" value={data.heatingOil || ''} onChange={(e) => handleNumChange('heatingOil', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Propane (kg)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" 
                    placeholder="0.00" value={data.propane || ''} onChange={(e) => handleNumChange('propane', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm text-gray-400 font-bold uppercase mb-4 border-b border-gray-800 pb-2">Mobile Combustion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Fleet Diesel (Liters)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" 
                    placeholder="0.00" value={data.diesel || ''} onChange={(e) => handleNumChange('diesel', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Fleet Petrol (Liters)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" 
                    placeholder="0.00" value={data.petrol || ''} onChange={(e) => handleNumChange('petrol', e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 font-bold uppercase mb-4 border-b border-gray-800 pb-2">Refrigerants</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">R410A Refill (kg)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" 
                    placeholder="0.00" value={data.r410a || ''} onChange={(e) => handleNumChange('r410a', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">R32 Refill (kg)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" 
                    placeholder="0.00" value={data.r32 || ''} onChange={(e) => handleNumChange('r32', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">R134a Refill (kg)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500 transition-colors" 
                    placeholder="0.00" value={data.r134a || ''} onChange={(e) => handleNumChange('r134a', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* SCOPE 2 */}
          <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">⚡ Scope 2: Energy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Electricity (kWh)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 transition-colors" 
                  placeholder="0.00" value={data.elec || ''} onChange={(e) => handleNumChange('elec', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">District Heating (kWh)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 transition-colors" 
                  placeholder="0.00" value={data.districtHeat || ''} onChange={(e) => handleNumChange('districtHeat', e.target.value)} />
              </div>
            </div>
          </section>

          {/* SCOPE 3 */}
          <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">✈️ Scope 3: Travel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Employee Vehicles (km)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-purple-500 transition-colors" 
                  placeholder="0.00" value={data.vehicleKm || ''} onChange={(e) => handleNumChange('vehicleKm', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Business Flights (km)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-purple-500 transition-colors" 
                  placeholder="0.00" value={data.flightKm || ''} onChange={(e) => handleNumChange('flightKm', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Hotel Nights</label>
                <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-purple-500 transition-colors" 
                  placeholder="0" value={data.hotelNights || ''} onChange={(e) => handleNumChange('hotelNights', e.target.value)} />
              </div>
            </div>
          </section>

          {/* FILE UPLOAD & SIGNER */}
          <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
             <div className="mb-6">
               <label className="block text-sm font-medium text-gray-300 mb-2">Upload Evidence (Invoices/Bills)</label>
               <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                 <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
                 <label htmlFor="file-upload" className="cursor-pointer">
                    <p className="text-gray-400">Click to upload files</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {data.files.length > 0 ? `${data.files.length} files attached` : "PDF, JPG, PNG (Max 10MB)"}
                    </p>
                 </label>
               </div>
               {data.files.length > 0 && (
                 <div className="mt-2 text-xs text-gray-500">
                   {data.files.map((f, i) => <div key={i}>• {f}</div>)}
                 </div>
               )}
             </div>

             <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold">Authorized Signer Name</label>
                <input type="text" required value={data.signerName} onChange={(e) => setData({...data, signerName: e.target.value})} 
                  className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-white outline-none" placeholder="e.g. Jean Dupont" />
              </div>
          </section>

          <div className="flex justify-end pb-20">
            <button type="submit" className="bg-white text-black font-extrabold py-4 px-12 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Generate Report ➔
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}