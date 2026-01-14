'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function Scope3Page() {
  const router = useRouter();
  const { data, setData } = useESG();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const handleNumChange = (field: string, value: string) => {
    setData({ ...data, [field]: value === '' ? 0 : parseFloat(value) });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-2xl mx-auto mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm">← Back to Dashboard</Link>
      </nav>

      <main className="max-w-2xl mx-auto">
        <div className="border-l-4 border-purple-500 pl-6 mb-8">
          <h1 className="text-3xl font-bold text-purple-500">Scope 3</h1>
          <p className="text-gray-400">Indirect emissions from the value chain (Business Travel).</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8 bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2">Business Travel Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <label className="text-xs text-gray-500 block mb-1">Employee Vehicles (km)</label>
                 <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-purple-500" 
                   value={data.vehicleKm || ''} onChange={(e) => handleNumChange('vehicleKm', e.target.value)} />
               </div>
               <div>
                 <label className="text-xs text-gray-500 block mb-1">Business Flights (km)</label>
                 <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-purple-500" 
                   value={data.flightKm || ''} onChange={(e) => handleNumChange('flightKm', e.target.value)} />
               </div>
               <div>
                 <label className="text-xs text-gray-500 block mb-1">Hotel Nights</label>
                 <input type="number" className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-purple-500" 
                   value={data.hotelNights || ''} onChange={(e) => handleNumChange('hotelNights', e.target.value)} />
               </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-500 transition-colors">
            Save Scope 3 Data
          </button>
        </form>
      </main>
    </div>
  );
}