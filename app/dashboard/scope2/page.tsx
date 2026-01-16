'use client';
import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function Scope2() {
  const { activityData, updateActivity, isSaving } = useESG();

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
       <div className="flex justify-between items-center mb-8">
        <Link href="/dashboard/hub" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={14}/> Back to Hub
        </Link>
        {isSaving && <span className="text-xs text-green-600 font-bold animate-pulse uppercase tracking-wider">Saving...</span>}
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">2</span>
            <h1 className="text-3xl font-bold text-gray-900">Indirect Energy</h1>
        </div>
        <p className="text-gray-500 ml-11 text-lg">
            Electricity and heating purchased from utility providers.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput label="Purchased Electricity" unit="kWh" value={activityData['electricity_fr'] || 0} onChange={(v) => updateActivity('electricity_fr', v)} />
            <NumberInput label="District Heating" unit="kWh" value={activityData['district_heat'] || 0} onChange={(v) => updateActivity('district_heat', v)} />
        </div>
      </div>

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