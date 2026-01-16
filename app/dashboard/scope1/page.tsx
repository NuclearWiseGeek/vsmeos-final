'use client';
import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function Scope1() {
  const { activityData, updateActivity, isSaving } = useESG();

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      {/* Nav */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/dashboard/hub" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={14}/> Back to Hub
        </Link>
        {isSaving && <span className="text-xs text-green-600 font-bold animate-pulse uppercase tracking-wider">Saving...</span>}
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</span>
            <h1 className="text-3xl font-bold text-gray-900">Direct Emissions</h1>
        </div>
        <p className="text-gray-500 ml-11 text-lg">
            Enter the fuel consumed directly by your company's facilities and owned vehicles.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-lg">Stationary Combustion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput label="Natural Gas" unit="kWh" value={activityData['natural_gas'] || 0} onChange={(v) => updateActivity('natural_gas', v)} />
            <NumberInput label="Heating Oil" unit="Liters" value={activityData['heating_oil'] || 0} onChange={(v) => updateActivity('heating_oil', v)} />
            <NumberInput label="Propane" unit="kg" value={activityData['propane'] || 0} onChange={(v) => updateActivity('propane', v)} />
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-lg">Mobile Combustion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput label="Diesel Fuel" unit="Liters" value={activityData['diesel'] || 0} onChange={(v) => updateActivity('diesel', v)} />
            <NumberInput label="Petrol / Gasoline" unit="Liters" value={activityData['petrol'] || 0} onChange={(v) => updateActivity('petrol', v)} />
        </div>
      </div>

       <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-lg">Refrigerants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NumberInput label="R410A" unit="kg" value={activityData['ref_R410A'] || 0} onChange={(v) => updateActivity('ref_R410A', v)} />
            <NumberInput label="R32" unit="kg" value={activityData['ref_R32'] || 0} onChange={(v) => updateActivity('ref_R32', v)} />
            <NumberInput label="R134a" unit="kg" value={activityData['ref_R134a'] || 0} onChange={(v) => updateActivity('ref_R134a', v)} />
        </div>
      </div>

      {/* Action */}
      <div className="mt-8 flex justify-end">
        <Link href="/dashboard/hub">
            <button className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-transform hover:scale-[1.02] flex items-center gap-2 shadow-lg">
                <Check size={18} /> Save & Return to Hub
            </button>
        </Link>
      </div>
    </div>
  );
}