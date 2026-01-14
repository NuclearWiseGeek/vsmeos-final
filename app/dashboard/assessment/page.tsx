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
    setData({ ...data, [field]: parseFloat(value) || 0 });
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
          
          {/* SCOPE 1: DIRECT EMISSIONS */}
          <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-400">🔥 Scope 1: Direct</h2>
            
            <div className="mb-6">
              <h3 className="text-sm text-gray-400 font-bold uppercase mb-4 border-b border-gray-800 pb-2">Stationary Combustion</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Natural Gas (kWh)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                    value={data.gas || ''} onChange={(e) => handleNumChange('gas', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Heating Oil (Liters)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                    value={data.heatingOil || ''} onChange={(e) => handleNumChange('heatingOil', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Propane (kg)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                    value={data.propane || ''} onChange={(e) => handleNumChange('propane', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm text-gray-400 font-bold uppercase mb-4 border-b border-gray-800 pb-2">Mobile Combustion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Fleet Diesel (Liters)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                    value={data.diesel || ''} onChange={(e) => handleNumChange('diesel', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">Fleet Petrol (Liters)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                    value={data.petrol || ''} onChange={(e) => handleNumChange('petrol', e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 font-bold uppercase mb-4 border-b border-gray-800 pb-2">Fugitive Emissions (Refrigerants)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">R410A Refill (kg)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                    value={data.r410a || ''} onChange={(e) => handleNumChange('r410a', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">R32 Refill (kg)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                    value={data.r32 || ''} onChange={(e) => handleNumChange('r32', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold">R134a Refill (kg)</label>
                  <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                    value={data.r134a || ''} onChange={(e) => handleNumChange('r134a', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* SCOPE 2: INDIRECT ENERGY */}
          <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">⚡ Scope 2: Energy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Electricity (kWh)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                  value={data.elec || ''} onChange={(e) => handleNumChange('elec', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">District Heating (kWh)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                  value={data.districtHeat || ''} onChange={(e) => handleNumChange('districtHeat', e.target.value)} />
              </div>
            </div>
          </section>

          {/* SCOPE 3: BUSINESS TRAVEL */}
          <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">✈️ Scope 3: Travel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Employee Vehicles (km)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                  value={data.vehicleKm || ''} onChange={(e) => handleNumChange('vehicleKm', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Business Flights (km)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                  value={data.flightKm || ''} onChange={(e) => handleNumChange('flightKm', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold">Hotel Nights</label>
                <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" 
                  value={data.hotelNights || ''} onChange={(e) => handleNumChange('hotelNights', e.target.value)} />
              </div>
            </div>
          </section>

          <div className="flex flex-col items-center gap-6 pb-20">
            <div className="w-full max-w-sm">
              <label className="text-xs text-gray-500 font-bold block mb-2 text-center">Authorized Signer</label>
              <input type="text" required className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-center outline-none" 
                placeholder="Full Legal Name" value={data.signerName} onChange={(e) => setData({...data, signerName: e.target.value})} />
            </div>
            <button type="submit" className="bg-white text-black font-extrabold py-4 px-12 rounded-full hover:scale-105 transition-transform">
              Generate Report ➔
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}