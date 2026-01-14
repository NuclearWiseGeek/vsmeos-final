'use client';

import React from 'react';
import Link from 'next/link';
import { useESG } from '../../context/ESGContext';
import { generatePDF } from '../../utils/pdfGenerator'; // Import our new engine

export default function ReviewPage() {
  const { data } = useESG();

  return (
    <div className="max-w-4xl mx-auto py-10">
      
      {/* 1. Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Review & Export</h1>
        <p className="text-gray-400">
          Please review your data below. If everything is correct, download your official certificate.
        </p>
      </div>

      {/* 2. The Data Summary Card */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mb-8 shadow-2xl">
        
        {/* Company Header */}
        <div className="border-b border-gray-800 pb-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{data.companyName || 'Your Company Name'}</h2>
            <p className="text-blue-400">{data.country} • {data.revenue} {data.currency}</p>
          </div>
          <div className="px-4 py-1 rounded-full bg-green-900/30 border border-green-800 text-green-400 text-xs font-bold uppercase tracking-wider">
            Ready to Sign
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          
          {/* Scope 1 Column */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs">Scope 1 (Direct)</h3>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Gas</span>
              <span className="text-white">{data.gas || '0'} kWh</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Diesel</span>
              <span className="text-white">{data.diesel || '0'} L</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Refrigerants</span>
              <span className="text-white">{data.r410a || '0'} kg</span>
            </div>
          </div>

          {/* Scope 2 Column */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs">Scope 2 (Indirect)</h3>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Electricity</span>
              <span className="text-white">{data.elec || '0'} kWh</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Heating</span>
              <span className="text-white">{data.districtHeat || '0'} kWh</span>
            </div>
          </div>

          {/* Scope 3 Column */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs">Scope 3 (Travel)</h3>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Flights</span>
              <span className="text-white">{data.flightKm || '0'} km</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1">
              <span className="text-gray-400">Hotels</span>
              <span className="text-white">{data.hotelNights || '0'} nights</span>
            </div>
          </div>
        </div>

        {/* Signer Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-right">
          <p className="text-gray-500 text-xs uppercase mb-1">Digitally Signed By</p>
          <p className="text-lg font-bold text-white">{data.signerName || 'Pending Signature'}</p>
        </div>

      </div>

      {/* 3. Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <Link 
          href="/dashboard/scope3"
          className="w-full md:w-auto px-6 py-4 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-center"
        >
          ← Go Back
        </Link>
        
        <button 
          onClick={() => generatePDF(data)}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          <span>📄</span>
          <span>Download Official PDF Report</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

    </div>
  );
}