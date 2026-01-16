'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useESG } from '../../context/ESGContext';
import { generateCarbonPack } from '../../utils/pdfGenerator';

export default function Results() {
  const { data, resetData } = useESG();
  const router = useRouter();

  const handleNewAssessment = () => {
    resetData();
    router.push('/dashboard');
  };

  // Helper to safely parse strings like "1,000.00" into numbers
  const getVal = (val: string) => {
    if (!val) return 0;
    return parseFloat(val.replace(/,/g, '')) || 0;
  };

  // --- ADEME FACTORS ---
  const FACTORS = {
    gas: 0.244, heatingOil: 3.2, propane: 3.1,
    diesel: 3.16, petrol: 2.8,
    r410a: 2088, r32: 675, r134a: 1430,
    elec: 0.052, districtHeat: 0.170,
    vehicleKm: 0.218, flightKm: 0.14, hotelNights: 6.9
  };

  // --- CALCULATIONS ---
  const s1 = (getVal(data.gas) * FACTORS.gas) + (getVal(data.heatingOil) * FACTORS.heatingOil) + (getVal(data.propane) * FACTORS.propane) +
             (getVal(data.diesel) * FACTORS.diesel) + (getVal(data.petrol) * FACTORS.petrol) +
             (getVal(data.r410a) * FACTORS.r410a) + (getVal(data.r32) * FACTORS.r32) + (getVal(data.r134a) * FACTORS.r134a);
             
  const s2 = (getVal(data.elec) * FACTORS.elec) + (getVal(data.districtHeat) * FACTORS.districtHeat);
  const s3 = (getVal(data.vehicleKm) * FACTORS.vehicleKm) + (getVal(data.flightKm) * FACTORS.flightKm) + (getVal(data.hotelNights) * FACTORS.hotelNights);
  const total = s1 + s2 + s3;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-4xl mx-auto mb-12 border-b border-gray-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Step 3: Validated Results</h1>
          <p className="text-gray-400 text-sm">Calculated for: <span className="text-white font-bold">{data.companyName || 'Unknown Company'}</span></p>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto text-center">
        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Scope 1</p>
            <p className="text-4xl font-bold mb-1">{s1.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className="text-green-400 text-xs font-medium px-2 py-1 bg-green-900/20 inline-block rounded">kgCO2e</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Scope 2</p>
            <p className="text-4xl font-bold mb-1">{s2.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className="text-green-400 text-xs font-medium px-2 py-1 bg-green-900/20 inline-block rounded">kgCO2e</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Scope 3</p>
            <p className="text-4xl font-bold mb-1">{s3.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className="text-green-400 text-xs font-medium px-2 py-1 bg-green-900/20 inline-block rounded">kgCO2e</p>
          </div>
        </div>

        {/* Total */}
        <div className="mb-12">
          <p className="text-gray-400 mb-2">Total Carbon Footprint</p>
          <p className="text-6xl font-extrabold text-white mb-8">
            {total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-2xl font-normal text-gray-500">kgCO2e</span>
          </p>
          <div className="inline-block border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-400">
             Authorized Signer: <span className="text-white font-bold">{data.signerName || 'Pending Signature'}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => generateCarbonPack(data)}
            className="bg-white text-black font-bold py-4 px-10 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            Download Corporate Carbon Pack (PDF)
          </button>
          
          <button onClick={handleNewAssessment} className="text-gray-500 hover:text-white text-sm underline">
            Start New Assessment (Reset)
          </button>
        </div>
      </main>
    </div>
  );
}