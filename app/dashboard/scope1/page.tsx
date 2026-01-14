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
    router.push('/dashboard');
  };

  // 1. Format Helper
  const formatNumber = (val: string) => {
    if (!val) return '';
    const clean = val.replace(/,/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // 2. Change Handler (Allows digits/commas/dots)
  const handleChange = (field: string, val: string) => {
    if (/^[\d,.]*$/.test(val)) {
      setData({ ...data, [field]: val });
    }
  };

  // 3. Blur Handler (Formats on exit)
  const handleBlur = (field: string) => {
    // @ts-ignore
    const formatted = formatNumber(data[field]);
    setData({ ...data, [field]: formatted });
  };

  const InputField = ({ label, field }: { label: string, field: string }) => (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input 
        type="text" 
        className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-orange-500" 
        // @ts-ignore
        value={data[field]} 
        onChange={(e) => handleChange(field, e.target.value)}
        onBlur={() => handleBlur(field)}
        placeholder="0.00"
      />
    </div>
  );

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <InputField label="Natural Gas (kWh)" field="gas" />
               <InputField label="Heating Oil (Liters)" field="heatingOil" />
               <InputField label="Propane (kg)" field="propane" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2">Mobile Combustion</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <InputField label="Fleet Diesel (Liters)" field="diesel" />
               <InputField label="Fleet Petrol (Liters)" field="petrol" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2">Fugitive Emissions (Refrigerants)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <InputField label="R410A Refill (kg)" field="r410a" />
               <InputField label="R32 Refill (kg)" field="r32" />
               <InputField label="R134a Refill (kg)" field="r134a" />
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