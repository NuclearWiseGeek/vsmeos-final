'use client';
import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function Scope1() {
  const { activityData, updateActivity, isSaving } = useESG();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:py-12 sm:px-6">
      
      {/* Nav */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <Link href="/supplier/hub" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={14}/> Back to Hub
        </Link>
        {isSaving && <span className="text-xs text-green-600 font-bold animate-pulse uppercase tracking-wider">Saving...</span>}
      </div>

      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Direct Emissions</h1>
        </div>
        <p className="text-gray-500 ml-11 text-base sm:text-lg leading-relaxed">
            Enter the fuel consumed directly by your company's facilities and owned vehicles.
        </p>
      </div>

      {/* CARD 1: Stationary Combustion */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-base sm:text-lg">Stationary Combustion</h3>
        {/* LAYOUT: 2 Columns per row as requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput 
                label="Natural Gas" 
                unit="kWh" 
                helpText="Gas from the grid used for heating buildings or water."
                value={activityData['natural_gas'] || 0} 
                onChange={(v) => updateActivity('natural_gas', v)} 
            />
            <NumberInput 
                label="Heating Oil" 
                unit="Liters" 
                helpText="Liquid fuel stored in tanks, used for boilers or furnaces."
                value={activityData['heating_oil'] || 0} 
                onChange={(v) => updateActivity('heating_oil', v)} 
            />
            <NumberInput 
                label="Propane" 
                unit="kg" 
                helpText="LPG in bottles/tanks used for heating, cooking, or forklifts."
                value={activityData['propane'] || 0} 
                onChange={(v) => updateActivity('propane', v)} 
            />
        </div>
      </div>

      {/* CARD 2: Mobile Combustion */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-base sm:text-lg">Mobile Combustion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput 
                label="Diesel Fuel" 
                unit="Liters" 
                helpText="Standard diesel for company-owned cars, trucks, or vans."
                value={activityData['diesel'] || 0} 
                onChange={(v) => updateActivity('diesel', v)} 
            />
            <NumberInput 
                label="Petrol / Gasoline" 
                unit="Liters" 
                helpText="Unleaded gasoline (E10/E5/SP95) for company passenger vehicles."
                value={activityData['petrol'] || 0} 
                onChange={(v) => updateActivity('petrol', v)} 
            />
        </div>
      </div>

       {/* CARD 3: Refrigerants */}
       <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 text-base sm:text-lg">Refrigerants (Fugitive Leaks)</h3>
        {/* LAYOUT: 2 Columns per row to match the style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput 
                label="R410A" 
                unit="kg" 
                helpText="Most common gas found in modern office air conditioning units."
                value={activityData['ref_R410A'] || 0} 
                onChange={(v) => updateActivity('ref_R410A', v)} 
            />
            <NumberInput 
                label="R32" 
                unit="kg" 
                helpText="Newer, high-efficiency gas for split-system AC units."
                value={activityData['ref_R32'] || 0} 
                onChange={(v) => updateActivity('ref_R32', v)} 
            />
            <NumberInput 
                label="R134a" 
                unit="kg" 
                helpText="Standard gas used in vehicle air conditioning systems."
                value={activityData['ref_R134a'] || 0} 
                onChange={(v) => updateActivity('ref_R134a', v)} 
            />
            <NumberInput 
                label="R404A" 
                unit="kg" 
                helpText="Common gas for commercial freezers and cold storage."
                value={activityData['ref_R404A'] || 0} 
                onChange={(v) => updateActivity('ref_R404A', v)} 
            />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 flex justify-center sm:justify-end">
        <Link href="/supplier/hub" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-transform active:scale-[1.02] flex items-center justify-center gap-2 shadow-lg">
                <Check size={18} /> Save & Return to Hub
            </button>
        </Link>
      </div>
    </div>
  );
}