'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

// --- COMPONENT DEFINED OUTSIDE ---
const InputField = ({ label, value, onChange, onBlur }: { 
  label: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onBlur: () => void 
}) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">{label}</label>
    <input 
      type="text" 
      className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-blue-500" 
      value={value} 
      onChange={onChange}
      onBlur={onBlur}
      placeholder="0.00"
    />
  </div>
);

export default function Scope2Page() {
  const router = useRouter();
  const { data, setData } = useESG();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const formatNumber = (val: string) => {
    if (!val) return '';
    const clean = val.replace(/,/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleChange = (field: string, val: string) => {
    if (/^[\d,.]*$/.test(val)) setData(prev => ({ ...prev, [field]: val }));
  };

  const handleBlur = (field: string) => {
    // @ts-ignore
    setData(prev => ({ ...prev, [field]: formatNumber(prev[field]) }));
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
               <InputField label="Electricity (kWh)" value={data.elec} onChange={(e) => handleChange('elec', e.target.value)} onBlur={() => handleBlur('elec')} />
               <InputField label="District Heating (kWh)" value={data.districtHeat} onChange={(e) => handleChange('districtHeat', e.target.value)} onBlur={() => handleBlur('districtHeat')} />
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