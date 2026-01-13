'use client';
import React from 'react';
import Link from 'next/link';
import { useESG } from '../../context/ESGContext';
import { generateCarbonPack } from '../../utils/pdfGenerator';

export default function Results() {
  const { data } = useESG();

  // --- 1. ADEME Emission Factors (from your app.py) ---
  const FACTORS = {
    gas: 0.244,          // kgCO2e/kWh
    diesel: 3.16,        // kgCO2e/Liter
    petrol: 2.8,         // kgCO2e/Liter
    elec: 0.052,         // kgCO2e/kWh (France)
    districtHeat: 0.170, // kgCO2e/kWh
    vehicleKm: 0.218,    // kgCO2e/km (Avg Car)
    flightKm: 0.14,      // kgCO2e/km
    hotelNights: 6.9     // kgCO2e/night
  };

  // --- 2. Calculate Totals ---
  const s1_gas = data.gas * FACTORS.gas;
  const s1_diesel = data.diesel * FACTORS.diesel;
  const s1_petrol = data.petrol * FACTORS.petrol;
  const scope1 = s1_gas + s1_diesel + s1_petrol;

  const s2_elec = data.elec * FACTORS.elec;
  const s2_heat = data.districtHeat * FACTORS.districtHeat;
  const scope2 = s2_elec + s2_heat;

  const s3_car = data.vehicleKm * FACTORS.vehicleKm;
  const s3_flight = data.flightKm * FACTORS.flightKm;
  const s3_hotel = data.hotelNights * FACTORS.hotelNights;
  const scope3 = s3_car + s3_flight + s3_hotel;

  const total = scope1 + scope2 + scope3;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-4xl mx-auto mb-12 border-b border-gray-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Step 3: Validated Results</h1>
          <p className="text-gray-400 text-sm">Calculated for: <span className="text-white font-bold">{data.companyName || 'Unknown Company'}</span></p>
        </div>
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">Dashboard</Link>
      </nav>

      <main className="max-w-4xl mx-auto text-center">
        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Scope 1</p>
            <p className="text-4xl font-bold mb-1">{scope1.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            <p className="text-green-400 text-xs font-medium px-2 py-1 bg-green-900/20 inline-block rounded">kgCO2e</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Scope 2</p>
            <p className="text-4xl font-bold mb-1">{scope2.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            <p className="text-green-400 text-xs font-medium px-2 py-1 bg-green-900/20 inline-block rounded">kgCO2e</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Scope 3</p>
            <p className="text-4xl font-bold mb-1">{scope3.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            <p className="text-green-400 text-xs font-medium px-2 py-1 bg-green-900/20 inline-block rounded">kgCO2e</p>
          </div>
        </div>

        {/* Total */}
        <div className="mb-12">
          <p className="text-gray-400 mb-2">Total Carbon Footprint</p>
          <p className="text-6xl font-extrabold text-white mb-8">
            {total.toLocaleString(undefined, {maximumFractionDigits: 2})} <span className="text-2xl font-normal text-gray-500">kgCO2e</span>
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
          <Link href="/dashboard/profile" className="text-gray-500 hover:text-white text-sm">
            Start New Assessment
          </Link>
        </div>
      </main>
    </div>
  );
}