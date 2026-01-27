'use client';
import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Check, Plane } from 'lucide-react';

export default function Scope3() {
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
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Business Travel</h1>
        </div>
        <p className="text-gray-500 ml-11 text-base sm:text-lg leading-relaxed">
            Emissions from employee travel in non-company vehicles (planes, trains, and personal cars).
        </p>
      </div>

      {/* INPUT CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
        
        {/* SECTION 1: LAND TRAVEL */}
        <div className="mb-8 border-b border-gray-100 pb-8">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-6">Land Travel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NumberInput 
                    label="Employee Vehicles (Grey Fleet)" 
                    unit="km" 
                    helpText="Total distance driven by employees in their PERSONAL vehicles for business purposes (reimbursed via expense reports)."
                    value={activityData['grey_fleet'] || 0} 
                    onChange={(v) => updateActivity('grey_fleet', v)} 
                />
                <NumberInput 
                    label="Rail / Train Travel" 
                    unit="km" 
                    helpText="Distance traveled via train (TGV, Eurostar, Regional) for business trips."
                    value={activityData['rail_travel'] || 0} 
                    onChange={(v) => updateActivity('rail_travel', v)} 
                />
            </div>
        </div>

        {/* SECTION 2: AIR & ACCOMMODATION */}
        <div>
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-6">Air & Accommodation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NumberInput 
                    label="Business Flights" 
                    unit="km" 
                    helpText="Total flight distance for business trips. Sum of short-haul and long-haul flights."
                    value={activityData['air_travel'] || 0} 
                    onChange={(v) => updateActivity('air_travel', v)} 
                />
                <NumberInput 
                    label="Hotel Stays" 
                    unit="Nights" 
                    helpText="Total number of hotel nights booked for business travel worldwide."
                    value={activityData['hotel_nights'] || 0} 
                    onChange={(v) => updateActivity('hotel_nights', v)} 
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