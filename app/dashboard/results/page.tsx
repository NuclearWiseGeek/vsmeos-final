'use client';
import React from 'react';
import Link from 'next/link';

export default function Results() {
  // These are the exact factors from your app.py
  const factors = {
    gas: 0.244,
    elec: 0.052,
    diesel: 3.16
  };

  // Mock data representing what will eventually come from your form
  const mockData = {
    gasQty: 500,
    elecQty: 45000,
    scope1: 122.00, // (500 * 0.244)
    scope2: 2340.00, // (45000 * 0.052)
    total: 2462.00
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <nav className="max-w-4xl mx-auto mb-12 border-b border-gray-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Step 3: Validated</h1>
          <p className="text-gray-400 text-sm">Emissions calculated using ADEME Base Carbone v23.0</p>
        </div>
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">Dashboard</Link>
      </nav>

      <main className="max-w-4xl mx-auto text-center">
        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Scope 1</p>
            <p className="text-4xl font-bold mb-1">{mockData.scope1.toLocaleString()}</p>
            <p className="text-green-400 text-xs font-medium px-2 py-1 bg-green-900/20 inline-block rounded">↑ kgCO2e</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Scope 2</p>
            <p className="text-4xl font-bold mb-1">{mockData.scope2.toLocaleString()}</p>
            <p className="text-green-400 text-xs font-medium px-2 py-1 bg-green-900/20 inline-block rounded">↑ kgCO2e</p>
          </div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Scope 3</p>
            <p className="text-4xl font-bold mb-1">0.00</p>
            <p className="text-green-400 text-xs font-medium px-2 py-1 bg-green-900/20 inline-block rounded">↑ kgCO2e</p>
          </div>
        </div>

        {/* Total */}
        <div className="mb-12">
          <p className="text-gray-400 mb-2">Total Footprint</p>
          <p className="text-6xl font-extrabold text-white mb-8">
            {mockData.total.toLocaleString()} <span className="text-2xl font-normal text-gray-500">kgCO2e</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-4">
          <button className="bg-white text-black font-bold py-4 px-10 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2">
             Download Corporate Carbon Pack (PDF)
          </button>
          <Link href="/dashboard/profile" className="text-gray-500 hover:text-white text-sm">
            New Assessment
          </Link>
        </div>
      </main>
    </div>
  );
}