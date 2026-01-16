'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function ReviewPage() {
  const { data, setData } = useESG();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Calculate Totals for Preview
  const scope1 = Number(data.gas) + Number(data.heatingOil) + Number(data.diesel) + Number(data.petrol) + Number(data.r410a);
  const scope2 = Number(data.elec) + Number(data.districtHeat);
  const scope3 = Number(data.flightKm) + Number(data.hotelNights); // Simplified unit mix for preview

  const handleContinue = () => {
    if (!data.signerName) {
      alert("Please sign the declaration to continue.");
      return;
    }
    setLoading(true);
    // Simulate save/processing delay
    setTimeout(() => {
      router.push('/dashboard/results');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Review & Certify</h1>
        <p className="text-gray-400">Step 4 of 5: Verify your data and attach evidence.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* LEFT COL: Data Summary */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 border-b border-gray-800 pb-2">1. Data Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Scope 1 (Direct):</span>
                <span className="text-white font-mono">{scope1 > 0 ? 'Reported' : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scope 2 (Energy):</span>
                <span className="text-white font-mono">{scope2 > 0 ? 'Reported' : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scope 3 (Travel):</span>
                <span className="text-white font-mono">{scope3 > 0 ? 'Reported' : '-'}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Total Revenue:</span>
                <span className="text-blue-400 font-bold">{data.revenue} {data.currency}</span>
              </div>
            </div>
            
            <button 
               onClick={() => router.push('/dashboard/scope1')}
               className="mt-4 text-xs text-blue-500 hover:text-blue-400 underline"
            >
              Edit Data
            </button>
          </div>

          {/* UPLOAD EVIDENCE (Restored!) */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 border-b border-gray-800 pb-2">2. Upload Evidence</h3>
            <p className="text-xs text-gray-500 mb-4">Attach invoices for Electricity, Gas, or Fuel (Optional for MVP).</p>
            
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-gray-800/50 transition-all cursor-pointer">
              <span className="text-2xl mb-2 block">📎</span>
              <p className="text-sm text-gray-400">Click to upload files</p>
              <p className="text-xs text-gray-600 mt-1">(PDF, JPG, PNG)</p>
            </div>
          </div>
        </div>

        {/* RIGHT COL: Declaration */}
        <div className="space-y-6">
          <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-blue-400 font-bold mb-4 border-b border-blue-900/50 pb-2">3. Legal Declaration</h3>
            
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              I hereby certify that the data provided in this assessment is accurate to the best of my knowledge and corresponds to the operational activities of <strong>{data.companyName || 'my company'}</strong> for the reported year.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Authorized Signer Name</label>
              <input 
                type="text" 
                value={data.signerName}
                onChange={(e) => setData({ ...data, signerName: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button 
            onClick={handleContinue}
            disabled={loading}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : '✅ Confirm & Generate Report'}
          </button>
        </div>

      </div>
    </div>
  );
}