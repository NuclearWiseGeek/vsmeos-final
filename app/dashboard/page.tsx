'use client';
import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center mb-10 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
            VSMEOS
          </h1>
          <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-400">ESG OS</span>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
          <Link href="#" className="text-gray-400 hover:text-white">My Reports</Link>
          <Link href="/" className="text-red-400 hover:text-red-300 ml-4">Log Out</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto">
        {/* Header Greeting */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2">ESG Compliance Hub</h2>
            <p className="text-gray-400">Complete your Scopes to generate the report for your Buyer.</p>
          </div>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm border border-gray-700">
            Run Self-Test
          </button>
        </div>

        {/* The 3 Scopes - Data Entry Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Scope 1 */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-green-500/50 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-900/30 p-3 rounded-lg text-2xl">🏭</div>
              <span className="text-xs font-bold bg-red-900/50 text-red-300 px-2 py-1 rounded">Incomplete</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Scope 1</h3>
            <p className="text-sm text-gray-400 mb-4">Direct Emissions (Fuel, Vehicles)</p>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[10%]"></div>
            </div>
          </div>

          {/* Scope 2 */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-900/30 p-3 rounded-lg text-2xl">⚡</div>
              <span className="text-xs font-bold bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">Pending</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Scope 2</h3>
            <p className="text-sm text-gray-400 mb-4">Indirect Energy (Electricity, Heating)</p>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[0%]"></div>
            </div>
          </div>

          {/* Scope 3 */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-purple-500/50 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-900/30 p-3 rounded-lg text-2xl">🚚</div>
              <span className="text-xs font-bold bg-gray-800 text-gray-400 px-2 py-1 rounded">Optional</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Scope 3</h3>
            <p className="text-sm text-gray-400 mb-4">Supply Chain & Other Indirect</p>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[0%]"></div>
            </div>
          </div>
        </div>

        {/* Action Area: Send to Buyer */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to submit?</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Once all scopes are filled, generate the standardized ESG PDF to maintain your contract compliance.
            </p>
          </div>
          <button className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-transform hover:scale-105 opacity-50 cursor-not-allowed">
            Generate Report
          </button>
        </div>
      </main>
    </div>
  );
}