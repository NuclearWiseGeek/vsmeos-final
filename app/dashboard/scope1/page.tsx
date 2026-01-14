'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function Scope1Page() {
  const router = useRouter();
  const { data, setData } = useESG();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard'); // Go back to Hub
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
        <div className="border-l-4 border-orange-500 pl-6 mb-8">
          <h1 className="text-3xl font-bold text-orange-500">Scope 1</h1>
          <p className="text-gray-400">Direct emissions from owned or controlled sources.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8 bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2">Stationary Combustion</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs text-gray-500 block mb-1">Natural Gas (kWh)</label>
                 <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-orange-500" 
                   value={data.gas || ''} onChange={(e) => handleNumChange('gas', e.target.value)} />
               </div>
               <div>
                 <label className="text-xs text-gray-500 block mb-1">Heating Oil (Liters)</label>
                 <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-orange-500" 
                   value={data.heatingOil || ''} onChange={(e) => handleNumChange('heatingOil', e.target.value)} />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2">Mobile Combustion</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs text-gray-500 block mb-1">Diesel (Liters)</label>
                 <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-orange-500" 
                   value={data.diesel || ''} onChange={(e) => handleNumChange('diesel', e.target.value)} />
               </div>
               <div>
                 <label className="text-xs text-gray-500 block mb-1">Petrol (Liters)</label>
                 <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-orange-500" 
                   value={data.petrol || ''} onChange={(e) => handleNumChange('petrol', e.target.value)} />
               </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-orange-500 text-black font-bold py-4 rounded-xl hover:bg-orange-400 transition-colors">
            Save Scope 1 Data
          </button>
        </form>
      </main>
    </div>
  );
}