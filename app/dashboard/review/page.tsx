'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';

export default function ReviewPage() {
  const { data, setData } = useESG();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Simple checks to see if data was entered
  const hasScope1 = Number(data.gas) > 0 || Number(data.diesel) > 0 || Number(data.petrol) > 0;
  const hasScope2 = Number(data.elec) > 0;
  const hasScope3 = Number(data.flightKm) > 0 || Number(data.vehicleKm) > 0;

  const handleContinue = () => {
    if (!data.signerName) {
      alert("Please sign the declaration to continue.");
      return;
    }
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      router.push('/dashboard/results');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      
      <h1 className="text-3xl font-bold text-white mb-8">Review & Certify</h1>

      {/* 1. REVIEW DATA */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">1. Data Verification</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span>Company Name</span>
            <span className="text-white">{data.companyName || 'Not Set'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span>Scope 1 (Direct Emissions)</span>
            <span className={hasScope1 ? "text-green-400" : "text-gray-600"}>{hasScope1 ? 'Data Entered' : 'No Data'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span>Scope 2 (Electricity)</span>
            <span className={hasScope2 ? "text-green-400" : "text-gray-600"}>{hasScope2 ? 'Data Entered' : 'No Data'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span>Scope 3 (Travel)</span>
            <span className={hasScope3 ? "text-green-400" : "text-gray-600"}>{hasScope3 ? 'Data Entered' : 'No Data'}</span>
          </div>
        </div>
        <button 
          onClick={() => router.push('/dashboard/scope1')}
          className="mt-4 text-xs text-blue-500 hover:text-blue-400 underline"
        >
          Edit Information
        </button>
      </div>

      {/* 2. UPLOAD EVIDENCE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">2. Supporting Evidence</h3>
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:bg-gray-800 transition-colors cursor-pointer">
          <span className="text-2xl mb-2 block">📎</span>
          <p className="text-sm text-gray-400">Upload Energy Bills / Invoices</p>
          <p className="text-xs text-gray-600">(Optional for Draft)</p>
        </div>
      </div>

      {/* 3. SIGNATURE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">3. Declaration</h3>
        <p className="text-xs text-gray-500 mb-4">
          I certify that the data provided is accurate to the best of my knowledge.
        </p>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Authorized Signer</label>
          <input 
            type="text" 
            value={data.signerName}
            onChange={(e) => setData({ ...data, signerName: e.target.value })}
            placeholder="Type your full name"
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ACTION BUTTON */}
      <button 
        onClick={handleContinue}
        disabled={loading}
        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/20 transition-all"
      >
        {loading ? 'Generating Report...' : 'Confirm & Generate PDF →'}
      </button>

    </div>
  );
}