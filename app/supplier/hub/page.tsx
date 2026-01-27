'use client';
import { useESG } from '@/context/ESGContext';
import { calculateEmissions, summarizeEmissions } from '@/utils/calculations';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, CheckCircle2, Factory, Zap, Plane } from 'lucide-react';

export default function AssessmentHub() {
  const { activityData } = useESG();
  
  // Real-time calculation for the flashcards
  const results = calculateEmissions(activityData);
  const totals = summarizeEmissions(results);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

  return (
    // 1. Fluid Container Padding: px-4 on mobile, px-6 on desktop
    <div className="max-w-5xl mx-auto py-8 px-4 sm:py-12 sm:px-6">
      
      {/* Header: Allow wrapping on mobile (flex-col) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4">
        <div>
            {/* 2. Scalable Typography: text-2xl mobile -> text-3xl desktop */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Assessment Hub</h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Select a scope to input data. You can complete them in any order.</p>
        </div>
        <Link href="/supplier" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={14}/> Edit Company Profile
        </Link>
      </div>

      {/* Flashcards Grid: Gap reduced for mobile (gap-4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        
        {/* Scope 1 Card */}
        <Link href="/supplier/scope1" className="group">
            {/* 3. Card Padding: p-6 mobile -> p-8 desktop */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <div>
                    {/* Icon Container Scaling */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 relative z-10">
                        <Factory size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Scope 1</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Direct Emissions</p>
                </div>
                
                <div className="mt-6 sm:mt-8">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{fmt(totals.scope1)} <span className="text-xs sm:text-sm font-medium text-gray-400">kgCO2e</span></div>
                    <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        {totals.scope1 > 0 ? 'Edit Data' : 'Start Input'} <ArrowRight size={12} />
                    </div>
                </div>
            </div>
        </Link>

        {/* Scope 2 Card */}
        <Link href="/supplier/scope2" className="group">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 relative z-10">
                        <Zap size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Scope 2</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Indirect Energy</p>
                </div>
                
                <div className="mt-6 sm:mt-8">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{fmt(totals.scope2)} <span className="text-xs sm:text-sm font-medium text-gray-400">kgCO2e</span></div>
                    <div className="text-xs font-bold text-orange-600 flex items-center gap-1">
                        {totals.scope2 > 0 ? 'Edit Data' : 'Start Input'} <ArrowRight size={12} />
                    </div>
                </div>
            </div>
        </Link>

        {/* Scope 3 Card */}
        <Link href="/supplier/scope3" className="group">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 relative z-10">
                        <Plane size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Scope 3</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Business Travel</p>
                </div>
                
                <div className="mt-6 sm:mt-8">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{fmt(totals.scope3)} <span className="text-xs sm:text-sm font-medium text-gray-400">kgCO2e</span></div>
                    <div className="text-xs font-bold text-purple-600 flex items-center gap-1">
                        {totals.scope3 > 0 ? 'Edit Data' : 'Start Input'} <ArrowRight size={12} />
                    </div>
                </div>
            </div>
        </Link>

      </div>

      {/* Footer Action: Responsive layout */}
      <div className="flex flex-col items-center justify-center py-6 sm:py-8 border-t border-gray-100">
         <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Total Footprint:</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900">{fmt(totals.total)} kgCO2e</span>
         </div>
         
         <Link href="/supplier/results" className="w-full sm:w-auto">
            {/* 4. Full Width Button on Mobile */}
            <button className="w-full sm:w-auto bg-black text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-3">
                <CheckCircle2 size={20} />
                Finalize & View Report
            </button>
         </Link>
      </div>

    </div>
  );
}