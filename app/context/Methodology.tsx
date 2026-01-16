import React from 'react';
import { ShieldCheck, Globe, BookOpen } from 'lucide-react';

export default function Methodology() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Methodology & Compliance</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="flex flex-col gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Globe size={20} />
            </div>
            <h4 className="font-semibold text-gray-900">GHG Protocol Aligned</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
                Calculations follow the global standard for corporate carbon accounting, covering Scope 1 (Direct), Scope 2 (Energy), and relevant Scope 3 categories.
            </p>
        </div>

        <div className="flex flex-col gap-3">
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <ShieldCheck size={20} />
            </div>
            <h4 className="font-semibold text-gray-900">ADEME Factors</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
                We utilize the latest Base Carbone v23.0 emission factors provided by the French Agency for Ecological Transition (ADEME).
            </p>
        </div>

        <div className="flex flex-col gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <BookOpen size={20} />
            </div>
            <h4 className="font-semibold text-gray-900">CSRD Ready</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
                The output format is designed to support ESRS E1 reporting requirements for your enterprise buyers.
            </p>
        </div>

      </div>
    </div>
  );
}