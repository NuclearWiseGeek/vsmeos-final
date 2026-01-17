'use client';
import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function Scope3() {
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
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
            {/* 2. Scalable Title: text-2xl mobile -> text-3xl desktop */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Business Travel</h1>
        </div>
        {/* Adjusted left margin and text size for mobile */}
        <p className="text-gray-500 ml-11 text-base sm:text-lg leading-relaxed">
            Employee travel in non-company vehicles, commercial flights, and hotel stays.
        </p>
      </div>

      {/* INPUT CARD */}
      {/* 3. Card Padding: p-6 mobile -> p-8 desktop */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <NumberInput label="Employee Vehicles (Grey Fleet)" unit="km" value={activityData['grey_fleet_avg'] || 0} onChange={(v) => updateActivity('grey_fleet_avg', v)} />
            <NumberInput label="Business Flights" unit="km" value={activityData['flight_avg'] || 0} onChange={(v) => updateActivity('flight_avg', v)} />
            <NumberInput label="Hotel Stays" unit="Nights" value={activityData['hotel_night_avg'] || 0} onChange={(v) => updateActivity('hotel_night_avg', v)} />
        </div>
      </div>

      {/* Action Button: Center aligned on mobile, Right aligned on desktop */}
      <div className="mt-8 flex justify-center sm:justify-end">
        <Link href="/dashboard/hub" className="w-full sm:w-auto">
            {/* 4. Full Width Button on Mobile */}
            <button className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-transform active:scale-[1.02] flex items-center justify-center gap-2 shadow-lg">
                <Check size={18} /> Save & Return to Hub
            </button>
        </Link>
      </div>
    </div>
  );
}