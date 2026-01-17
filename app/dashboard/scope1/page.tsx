'use client';
import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function Scope1() {
  const { activityData, updateActivity, isSaving } = useESG();

  return (
    // 1. Fluid Container: px-4 on mobile, px-6 on desktop
    <div className="max-w-3xl mx-auto py-8 px-4 sm:py-12 sm:px-6">
      
      {/* Nav */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <Link href="/dashboard/hub" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={14}/> Back to Hub
        </Link>
        {isSaving && <span className="text-xs text-green-600 font-bold animate-pulse uppercase tracking-wider">Saving...</span>}
      </div>

      {/* Header Section */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
            {/* 2. Scalable Title: text-2xl on mobile -> text-3xl desktop */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Direct Emissions</h1>
        </div>
        {/* Adjusted left margin and text size for mobile */}
        <p className="text-gray-500 ml-11 text-base sm:text-lg leading-relaxed">
            Enter the fuel consumed directly by your company's facilities and owned vehicles.
        </p>
      </div>

      {/* INPUT CARD 1: Stationary Combustion */}
      {/* 3. Card Padding: p-6 mobile -> p-8 desktop */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-base sm:text-lg">Stationary Combustion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <NumberInput label="Natural Gas" unit="kWh" value={activityData['natural_gas'] || 0} onChange={(v) => updateActivity('natural_gas', v)} />
            <NumberInput label="Heating Oil" unit="Liters" value={activityData['heating_oil'] || 0} onChange={(v) => updateActivity('heating_oil', v)} />
            <NumberInput label="Propane" unit="kg" value={activityData['propane'] || 0} onChange={(v) => updateActivity('propane', v)} />
        </div>
      </div>

      {/* INPUT CARD 2: Mobile Combustion */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-base sm:text-lg">Mobile Combustion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <NumberInput label="Diesel Fuel" unit="Liters" value={activityData['diesel'] || 0} onChange={(v) => updateActivity('diesel', v)} />
            <NumberInput label="Petrol / Gasoline" unit="Liters" value={activityData['petrol'] || 0} onChange={(v) => updateActivity('petrol', v)} />
        </div>
      </div>

       {/* INPUT CARD 3: Refrigerants */}
       <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-base sm:text-lg">Refrigerants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <NumberInput label="R410A" unit="kg" value={activityData['ref_R410A'] || 0} onChange={(v) => updateActivity('ref_R410A', v)} />
            <NumberInput label="R32" unit="kg" value={activityData['ref_R32'] || 0} onChange={(v) => updateActivity('ref_R32', v)} />
            <NumberInput label="R134a" unit="kg" value={activityData['ref_R134a'] || 0} onChange={(v) => updateActivity('ref_R134a', v)} />
        </div>
      </div>

      {/* Action Button: Center aligned on mobile, Right aligned on desktop */}
      <div className="mt-8 flex justify-center sm:justify-end">
        <Link href="/dashboard/hub" className="w-full sm:w-auto">
            {/* 4. Full Width Button on Mobile */}
            <button className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg">
                <Check size={18} /> Save & Return to Hub
            </button>
        </Link>
      </div>
    </div>
  );
}