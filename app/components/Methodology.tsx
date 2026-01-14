import React from 'react';

export default function Methodology() {
  return (
    <section className="py-24 bg-black text-white" id="methodology">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Our Methodology
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            VSME OS is built on the <span className="text-white font-semibold">GHG Protocol Corporate Standard</span>, 
            the world's most widely used greenhouse gas accounting framework.
          </p>
        </div>

        {/* The 3 Scopes Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Scope 1 Card */}
          <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-500 transition-colors duration-300">
            <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-6 text-blue-400 font-bold text-xl">
              1
            </div>
            <h3 className="text-2xl font-bold mb-4">Scope 1: Direct</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Emissions from sources that your company owns or controls directly. This includes the fuel you burn in company cars and the gas used to heat your buildings.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center">✅ Natural Gas & Heating Oil</li>
              <li className="flex items-center">✅ Company Vehicle Fuel</li>
              <li className="flex items-center">✅ Refrigerant Leaks (AC)</li>
            </ul>
          </div>

          {/* Scope 2 Card */}
          <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500 transition-colors duration-300">
            <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mb-6 text-purple-400 font-bold text-xl">
              2
            </div>
            <h3 className="text-2xl font-bold mb-4">Scope 2: Indirect</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Emissions from the generation of purchased electricity, steam, heating, and cooling consumed by the reporting company.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center">✅ Electricity Consumption</li>
              <li className="flex items-center">✅ District Heating/Cooling</li>
              <li className="flex items-center">✅ Electric Vehicle Charging</li>
            </ul>
          </div>

          {/* Scope 3 Card */}
          <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-green-500 transition-colors duration-300">
            <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mb-6 text-green-400 font-bold text-xl">
              3
            </div>
            <h3 className="text-2xl font-bold mb-4">Scope 3: Value Chain</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              All other indirect emissions that occur in your company’s value chain. For the MVP, we focus on the most impactful business travel categories.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center">✅ Business Flights</li>
              <li className="flex items-center">✅ Hotel Stays</li>
              <li className="flex items-center">✅ Taxis & Trains</li>
            </ul>
          </div>

        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center border-t border-gray-800 pt-12">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">Calculation Factors Sourced From</p>
          <div className="flex justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all">
             <span className="text-xl font-bold text-white">ADEME (France)</span>
             <span className="text-xl font-bold text-white">•</span>
             <span className="text-xl font-bold text-white">GHG Protocol</span>
          </div>
        </div>

      </div>
    </section>
  );
}