'use client';
import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Check, Info } from 'lucide-react';

export default function Scope2() {
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

      {/* Header Section */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Indirect Energy</h1>
        </div>
        <p className="text-gray-500 ml-11 text-base sm:text-lg leading-relaxed">
            Electricity, heating, and cooling purchased from utility providers.
        </p>
      </div>

      {/* INPUT CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
        
        {/* SECTION 1: ELECTRICITY */}
        <div className="mb-8 border-b border-gray-100 pb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Electricity Consumption</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NumberInput 
                    label="Standard Grid Mix" 
                    unit="kWh" 
                    helpText="Electricity purchased from the standard national grid without any specific renewable contract."
                    value={activityData['electricity_fr'] || 0} 
                    onChange={(v) => updateActivity('electricity_fr', v)} 
                />
                <NumberInput 
                    label="Green / Renewable" 
                    unit="kWh" 
                    helpText="Electricity covered by a Green Tariff, PPA, or Guarantees of Origin (GoO/RECs)."
                    value={activityData['electricity_green'] || 0} 
                    onChange={(v) => updateActivity('electricity_green', v)} 
                />
            </div>
            <p className="text-[10px] text-gray-400 mt-3 ml-1">
                *Entering data in "Green / Renewable" will reduce your Market-Based Scope 2 emissions to near zero.
            </p>
        </div>

        {/* SECTION 2: THERMAL ENERGY */}
        <div>
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-6">Thermal Energy Networks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NumberInput 
                    label="District Heating" 
                    unit="kWh" 
                    helpText="Heat (steam or hot water) purchased from a local district heating network."
                    value={activityData['district_heat'] || 0} 
                    onChange={(v) => updateActivity('district_heat', v)} 
                />
                <NumberInput 
                    label="District Cooling" 
                    unit="kWh" 
                    helpText="Chilled water or cooling energy purchased from a district cooling network."
                    value={activityData['district_cool'] || 0} 
                    onChange={(v) => updateActivity('district_cool', v)} 
                />
            </div>
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