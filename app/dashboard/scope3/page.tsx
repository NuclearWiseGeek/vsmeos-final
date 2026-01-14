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

  const formatNumber = (val: string) => {
    if (!val) return '';
    const clean = val.replace(/,/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleChange = (field: string, val: string) => {
    if (/^[\d,.]*$/.test(val)) setData({ ...data, [field]: val });
  };

  const handleBlur = (field: string) => {
    // @ts-ignore
    setData({ ...data, [field]: formatNumber(data[field]) });
  };

  const InputField = ({ label, field }: { label: string, field: string }) => (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input 
        type="text" 
        className="w-full bg-black border border-gray-700 rounded p-3 outline-none focus:border-purple-500" 
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
        <div className="border-l-4 border-purple-500 pl-6 mb-8">
          <h1 className="text-3xl font-bold text-purple-500">Scope 3</h1>
          <p className="text-gray-400">Indirect emissions from the value chain.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8 bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-gray-800 pb-2">Business Travel Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <InputField label="Employee Vehicles (km)" field="vehicleKm" />
               <InputField label="Business Flights (km)" field="flightKm" />
               <InputField label="Hotel Nights" field="hotelNights" />
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