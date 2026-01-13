'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Assessment() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This moves the user to the final Step 3 results page
    router.push('/dashboard/results');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-4xl mx-auto mb-12 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Step 2: Activity Data</h1>
          <p className="text-gray-400 text-sm">Aligned with GHG Protocol (Scope 1, 2 & Business Travel)</p>
        </div>
        <Link href="/dashboard/profile" className="text-gray-500 hover:text-white text-sm">← Back to Profile</Link>
      </nav>

      <main className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* SCOPE 1: DIRECT EMISSIONS */}
          <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-400">
              🔥 Scope 1: Direct Emissions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">Natural Gas (kWh)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">Fleet Diesel (Liters)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">Fleet Petrol (Liters)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-orange-500" placeholder="0.00" />
              </div>
            </div>
          </section>

          {/* SCOPE 2: INDIRECT ENERGY */}
          <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
              ⚡ Scope 2: Indirect Energy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">Electricity (kWh)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">District Heating (kWh)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500" placeholder="0.00" />
              </div>
            </div>
          </section>

          {/* SCOPE 3: BUSINESS TRAVEL */}
          <section className="bg-gray-900/40 border border-gray-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">
              ✈️ Scope 3: Business Travel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">Employee Vehicles (km)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-purple-500" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">Business Flights (km)</label>
                <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-purple-500" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">Hotel Nights</label>
                <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-purple-500" placeholder="0" />
              </div>
            </div>
          </section>

          {/* EVIDENCE & SUBMIT */}
          <div className="flex flex-col items-center gap-6 pb-20">
            <div className="w-full max-w-sm">
              <label className="text-xs text-gray-500 uppercase font-bold block mb-2 text-center">Authorized Signer</label>
              <input type="text" required className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-center outline-none focus:border-white" placeholder="Full Legal Name" />
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