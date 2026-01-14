'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function Scope2Page() {
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
        <div className="border-l-4 border-blue-500 pl-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-500">Scope 2</h1>
          <p className="text-gray-400">Indirect emissions from purchased energy.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8 bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2">Purchased Energy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="text-xs text-gray-500 block mb-1">Electricity (kWh)</label>
                 <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-blue-500" 
                   value={data.elec || ''} onChange={(e) => handleNumChange('elec', e.target.value)} />
               </div>
               <div>
                 <label className="text-xs text-gray-500 block mb-1">District Heating (kWh)</label>
                 <input type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-blue-500" 
                   value={data.districtHeat || ''} onChange={(e) => handleNumChange('districtHeat', e.target.value)} />
               </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-500 transition-colors">
            Save Scope 2 Data
          </button>
        </form>
      </main>
    </div>
  );
}