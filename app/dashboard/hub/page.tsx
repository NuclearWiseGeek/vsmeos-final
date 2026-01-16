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
    <div className="max-w-5xl mx-auto py-12 px-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Assessment Hub</h1>
            <p className="text-gray-500 mt-2">Select a scope to input data. You can complete them in any order.</p>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={14}/> Edit Company Profile
        </Link>
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* Scope 1 Card */}
        <Link href="/dashboard/scope1" className="group">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <div>
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 relative z-10">
                        <Factory size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Scope 1</h3>
                    <p className="text-sm text-gray-500 mt-1">Direct Emissions</p>
                </div>
                
                <div className="mt-8">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{fmt(totals.scope1)} <span className="text-sm font-medium text-gray-400">kgCO2e</span></div>
                    <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        {totals.scope1 > 0 ? 'Edit Data' : 'Start Input'} <ArrowRight size={12} />
                    </div>
                </div>
            </div>
        </Link>

        {/* Scope 2 Card */}
        <Link href="/dashboard/scope2" className="group">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <div>
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 relative z-10">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Scope 2</h3>
                    <p className="text-sm text-gray-500 mt-1">Indirect Energy</p>
                </div>
                
                <div className="mt-8">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{fmt(totals.scope2)} <span className="text-sm font-medium text-gray-400">kgCO2e</span></div>
                    <div className="text-xs font-bold text-orange-600 flex items-center gap-1">
                        {totals.scope2 > 0 ? 'Edit Data' : 'Start Input'} <ArrowRight size={12} />
                    </div>
                </div>
            </div>
        </Link>

        {/* Scope 3 Card */}
        <Link href="/dashboard/scope3" className="group">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <div>
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 relative z-10">
                        <Plane size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Scope 3</h3>
                    <p className="text-sm text-gray-500 mt-1">Business Travel</p>
                </div>
                
                <div className="mt-8">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{fmt(totals.scope3)} <span className="text-sm font-medium text-gray-400">kgCO2e</span></div>
                    <div className="text-xs font-bold text-purple-600 flex items-center gap-1">
                        {totals.scope3 > 0 ? 'Edit Data' : 'Start Input'} <ArrowRight size={12} />
                    </div>
                </div>
            </div>
        </Link>

      </div>

      {/* Footer Action */}
      <div className="flex flex-col items-center justify-center py-8 border-t border-gray-100">
         <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Total Footprint:</span>
            <span className="text-xl font-bold text-gray-900">{fmt(totals.total)} kgCO2e</span>
         </div>
         
         <Link href="/dashboard/results">
            <button className="bg-black text-white px-10 py-5 rounded-full font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center gap-3">
                <CheckCircle2 size={20} />
                Finalize & View Report
            </button>
         </Link>
      </div>

    </div>
  );
}